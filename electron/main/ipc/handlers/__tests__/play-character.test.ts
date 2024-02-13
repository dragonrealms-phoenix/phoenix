import * as rxjs from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type GameEvent,
  GameEventType,
} from '../../../../common/game/types.js';
import { AccountServiceMockImpl } from '../../../account/__mocks__/account-service.mock.js';
import { GameServiceMockImpl } from '../../../game/__mocks__/game-service.mock.js';
import type { SGEService } from '../../../sge/types.js';
import { playCharacterHandler } from '../play-character.js';

const { mockGameInstance, mockSgeService } = vi.hoisted(() => {
  const mockGameInstance = {
    getInstance: vi.fn(),
    newInstance: vi.fn(),
  };

  const mockSgeService = {
    constructorSpy: vi.fn(),
    loginCharacter: vi.fn(),
    listCharacters: vi.fn(),
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
      .fn<
        Parameters<SGEService['loginCharacter']>,
        ReturnType<SGEService['loginCharacter']>
      >()
      .mockImplementation(async (characterName) => {
        return mockSgeService.loginCharacter(characterName);
      });

    listCharacters = vi
      .fn<
        Parameters<SGEService['listCharacters']>,
        ReturnType<SGEService['listCharacters']>
      >()
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
    it('plays a character with an account service', async () => {
      const mockIpcDispatcher = vi.fn();

      const mockAccountService = new AccountServiceMockImpl();
      mockAccountService.getAccount.mockResolvedValue({
        accountName: 'test-account-name',
        accountPassword: 'test-account-password',
      });

      mockSgeService.loginCharacter.mockResolvedValue({
        host: 'test-host',
        port: 1234,
        accessToken: 'test-access-token',
      });

      const mockGameService = new GameServiceMockImpl();
      mockGameInstance.newInstance.mockResolvedValue(mockGameService);

      const gameEvents$ = new rxjs.Subject<GameEvent>();
      mockGameService.connect.mockResolvedValue(gameEvents$);

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

      //--
      // The handler has authenticated into the game service
      // and is now ready to dispatch game events.
      //--

      expect(mockIpcDispatcher).not.toHaveBeenCalledWith(
        'game:event',
        expect.any(Object)
      );

      expect(mockIpcDispatcher).not.toHaveBeenCalledWith(
        'game:error',
        expect.any(Object)
      );

      expect(mockIpcDispatcher).not.toHaveBeenCalledWith(
        'game:disconnect',
        expect.any(Object)
      );

      // Simulate a game event.
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

      // Simulate the stream completing.
      gameEvents$.complete();

      expect(mockIpcDispatcher).toHaveBeenCalledWith('game:disconnect', {
        accountName: 'test-account-name',
        characterName: 'test-character-name',
        gameCode: 'test-game-code',
      });
    });

    it('throws an error if the account is not found', async () => {
      const mockIpcDispatcher = vi.fn();

      const mockAccountService = new AccountServiceMockImpl();

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
        expect.unreachable('should throw an error');
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
