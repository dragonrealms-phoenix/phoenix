import * as rxjs from 'rxjs';
import type { Mock, Mocked } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type GameEvent,
  GameEventType,
} from '../../../../common/game/types.js';
import { AccountServiceMockImpl } from '../../../account/__mocks__/account-service.mock.js';
import type { AccountService } from '../../../account/types.js';
import { GameServiceMockImpl } from '../../../game/__mocks__/game-service.mock.js';
import type { GameService } from '../../../game/types.js';
import type { SGEService } from '../../../sge/types.js';
import { playCharacterHandler } from '../play-character.js';

type GameInstanceModule = typeof import('../../../game/game.instance.js');
type MockSGEService = Mocked<SGEService> & { constructorSpy: Mock };

const { mockGameInstance, mockSgeService } = vi.hoisted(() => {
  const mockGameInstance: Mocked<GameInstanceModule['Game']> = {
    getInstance: vi.fn(),
    newInstance: vi.fn(),
  };

  const mockSgeService: MockSGEService = {
    constructorSpy: vi.fn(),
    loginCharacter: vi.fn<SGEService['loginCharacter']>(),
    listCharacters: vi.fn<SGEService['listCharacters']>(),
  };

  return {
    mockGameInstance,
    mockSgeService,
  };
});

vi.mock('../../../game/game.instance.js', () => {
  return {
    Game: mockGameInstance,
  };
});

vi.mock('../../../sge/sge.service.js', () => {
  class SGEServiceMockImpl implements SGEService {
    constructor(...args: Array<any>) {
      mockSgeService.constructorSpy(args);
    }

    loginCharacter = vi
      .fn<SGEService['loginCharacter']>()
      .mockImplementation(async (characterName) => {
        return mockSgeService.loginCharacter(characterName);
      });

    listCharacters = vi
      .fn<SGEService['listCharacters']>()
      .mockImplementation(async () => {
        return mockSgeService.listCharacters();
      });
  }

  return {
    SGEServiceImpl: SGEServiceMockImpl,
  };
});

describe('play-character', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#playCharacterHandler', async () => {
    let mockIpcDispatcher: Mock;
    let mockAccountService: Mocked<AccountService>;
    let mockGameService: Mocked<GameService>;
    let gameEvents$: rxjs.Subject<GameEvent>;

    beforeEach(() => {
      mockIpcDispatcher = vi.fn();

      mockAccountService = new AccountServiceMockImpl();
      mockAccountService.getAccount.mockResolvedValueOnce({
        accountName: 'test-account-name',
        accountPassword: 'test-account-password',
      });

      mockSgeService.loginCharacter.mockResolvedValueOnce({
        host: 'test-host',
        port: 1234,
        accessToken: 'test-access-token',
      });

      mockGameService = new GameServiceMockImpl();
      mockGameInstance.newInstance.mockResolvedValueOnce(mockGameService);

      gameEvents$ = new rxjs.Subject<GameEvent>();
      mockGameService.connect.mockResolvedValueOnce(gameEvents$);
    });

    it('logs into game as a character', async () => {
      const handler = playCharacterHandler({
        dispatch: mockIpcDispatcher,
        accountService: mockAccountService,
      });

      await handler([
        {
          accountName: 'test-account-name',
          characterName: 'test-character-name',
          gameCode: 'test-game-code',
        },
      ]);

      expect(mockAccountService.getAccount).toHaveBeenCalledWith({
        accountName: 'test-account-name',
      });

      expect(mockSgeService.constructorSpy).toHaveBeenCalledWith([
        {
          username: 'test-account-name',
          password: 'test-account-password',
          gameCode: 'test-game-code',
        },
      ]);

      expect(mockSgeService.loginCharacter).toHaveBeenCalledWith(
        'test-character-name'
      );

      expect(mockGameInstance.newInstance).toHaveBeenCalledWith({
        credentials: {
          host: 'test-host',
          port: 1234,
          accessToken: 'test-access-token',
        },
      });

      expect(mockGameService.connect).toHaveBeenCalled();

      expect(mockIpcDispatcher).toHaveBeenCalledWith('game:connect', {
        accountName: 'test-account-name',
        characterName: 'test-character-name',
        gameCode: 'test-game-code',
      });
    });

    it('dispatches a game event when the stream emits an event', async () => {
      const handler = playCharacterHandler({
        dispatch: mockIpcDispatcher,
        accountService: mockAccountService,
      });

      await handler([
        {
          accountName: 'test-account-name',
          characterName: 'test-character-name',
          gameCode: 'test-game-code',
        },
      ]);

      expect(mockIpcDispatcher).not.toHaveBeenCalledWith(
        'game:event',
        expect.any(Object)
      );

      gameEvents$.next({
        type: GameEventType.TEXT,
        eventId: 'test-event-id',
        text: 'test-text',
      });

      expect(mockIpcDispatcher).toHaveBeenCalledWith('game:event', {
        gameEvent: {
          type: GameEventType.TEXT,
          eventId: 'test-event-id',
          text: 'test-text',
        },
      });
    });

    it('dispatches an error event when the stream errors', async () => {
      const handler = playCharacterHandler({
        dispatch: mockIpcDispatcher,
        accountService: mockAccountService,
      });

      await handler([
        {
          accountName: 'test-account-name',
          characterName: 'test-character-name',
          gameCode: 'test-game-code',
        },
      ]);

      expect(mockIpcDispatcher).not.toHaveBeenCalledWith(
        'game:error',
        expect.any(Object)
      );

      const error = new Error('test-error');
      gameEvents$.error(error);

      expect(mockIpcDispatcher).toHaveBeenCalledWith('game:error', {
        error,
      });
    });

    it('dispatches a disconnect event when the stream completes', async () => {
      const handler = playCharacterHandler({
        dispatch: mockIpcDispatcher,
        accountService: mockAccountService,
      });

      await handler([
        {
          accountName: 'test-account-name',
          characterName: 'test-character-name',
          gameCode: 'test-game-code',
        },
      ]);

      expect(mockIpcDispatcher).not.toHaveBeenCalledWith(
        'game:disconnect',
        expect.any(Object)
      );

      gameEvents$.complete();

      expect(mockIpcDispatcher).toHaveBeenCalledWith('game:disconnect', {
        accountName: 'test-account-name',
        characterName: 'test-character-name',
        gameCode: 'test-game-code',
      });
    });

    it('throws an error if the account is not found', async () => {
      mockAccountService.getAccount.mockReset();

      const handler = playCharacterHandler({
        dispatch: mockIpcDispatcher,
        accountService: mockAccountService,
      });

      try {
        await handler([
          {
            accountName: 'test-account-name',
            characterName: 'test-character-name',
            gameCode: 'test-game-code',
          },
        ]);
        expect.unreachable('it should throw an error');
      } catch (error) {
        expect(mockIpcDispatcher).toHaveBeenCalledTimes(0);
        expect(mockAccountService.getAccount).toHaveBeenCalledWith({
          accountName: 'test-account-name',
        });
        expect(error).toEqual(
          new Error(
            `[IPC:PLAY_CHARACTER:ERROR:ACCOUNT_NOT_FOUND] test-account-name`
          )
        );
      }
    });
  });
});
