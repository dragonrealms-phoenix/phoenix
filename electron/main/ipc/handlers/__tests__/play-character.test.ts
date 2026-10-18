import type { BrowserWindow } from 'electron';
import * as rxjs from 'rxjs';
import type { Mock, Mocked } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GameCode,
  type GameEvent,
  GameEventType,
} from '../../../../common/game/types.js';
import { createBrowserWindowMock } from '../../../__mocks__/browser-window.mock.js';
import { AccountServiceMockImpl } from '../../../account/__mocks__/account-service.mock.js';
import type { AccountService } from '../../../account/types.js';
import { GameServiceMockImpl } from '../../../game/__mocks__/game-service.mock.js';
import type { GameService } from '../../../game/types.js';
import { PreferenceKey } from '../../../preference/types.js';
import { SettingServiceMockImpl } from '../../../setting/__mocks__/setting-service.mock.js';
import type { SettingService } from '../../../setting/types.js';
import type { SGEService } from '../../../sge/types.js';
import { playCharacterHandler } from '../play-character.js';

type GameInstanceModule = typeof import('../../../game/game.instance.js');
type MockSGEService = Mocked<SGEService> & { constructorSpy: Mock };

const {
  mockPreferenceService,
  mockGameInstance,
  mockSgeService,
  mockLichStartProcess,
} = await vi.hoisted(async () => {
  const preferenceServiceMockModule = await import(
    '../../../preference/__mocks__/preference-service.mock.js'
  );

  const mockPreferenceService =
    new preferenceServiceMockModule.PreferenceServiceMockImpl();

  const mockGameInstance: Mocked<GameInstanceModule['Game']> = {
    getInstance: vi.fn(),
    newInstance: vi.fn(),
  };

  const mockSgeService: MockSGEService = {
    constructorSpy: vi.fn(),
    loginCharacter: vi.fn<SGEService['loginCharacter']>(),
    listCharacters: vi.fn<SGEService['listCharacters']>(),
  };

  const mockLichStartProcess = vi.fn();

  return {
    mockPreferenceService,
    mockGameInstance,
    mockSgeService,
    mockLichStartProcess,
  };
});

vi.mock('../../../preference/preference.instance.js', () => {
  return {
    Preferences: mockPreferenceService,
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

vi.mock('../../../lich/start-process.js', () => {
  return {
    startLichProcess: mockLichStartProcess,
  };
});

vi.mock('../../../logger/logger.factory.ts');

describe('play-character', () => {
  let gameEvents$: rxjs.Subject<GameEvent>;

  beforeEach(() => {
    mockPreferenceService.get.mockReset().mockReturnValue(false);

    mockLichStartProcess.mockReset();

    mockSgeService.loginCharacter.mockReset();

    mockGameInstance.newInstance.mockReset();

    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    gameEvents$.complete();
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#playCharacterHandler', () => {
    let mockIpcDispatcher: Mock;
    let mockAccountService: Mocked<AccountService>;
    let mockGameService: Mocked<GameService>;
    let mockWindow: Mocked<BrowserWindow>;
    let mockSettingService: Mocked<SettingService>;

    beforeEach(() => {
      mockIpcDispatcher = vi.fn();

      mockWindow = createBrowserWindowMock();

      mockSettingService = new SettingServiceMockImpl();
      mockSettingService.getEnabledHighlights.mockReturnValue([]);
      mockSettingService.getEnabledIgnores.mockReturnValue([]);
      mockSettingService.getEnabledSubstitutes.mockReturnValue([]);
      mockSettingService.getEnabledTriggers.mockReturnValue([]);
      mockSettingService.load.mockResolvedValue(undefined);

      mockAccountService = new AccountServiceMockImpl();
      mockAccountService.getAccount.mockReturnValue({
        accountName: 'test-account-name',
        accountPassword: 'test-account-password',
      });

      mockSgeService.loginCharacter.mockResolvedValue({
        host: 'test-host',
        port: 1234,
        accessToken: 'test-access-token',
      });

      mockGameService = new GameServiceMockImpl();
      mockGameInstance.newInstance.mockResolvedValue(mockGameService);

      gameEvents$ = new rxjs.Subject<GameEvent>();
      mockGameService.connect.mockResolvedValue(gameEvents$);
    });

    it('logs into game as a character', async () => {
      const handler = playCharacterHandler({
        dispatch: mockIpcDispatcher,
        accountService: mockAccountService,
        window: mockWindow,
        settingService: mockSettingService,
      });

      await handler([
        {
          accountName: 'test-account-name',
          characterName: 'test-character-name',
          gameCode: GameCode.PRIME,
        },
      ]);

      expect(mockAccountService.getAccount).toHaveBeenCalledWith({
        accountName: 'test-account-name',
      });

      expect(mockWindow.setTitle).toHaveBeenCalledExactlyOnceWith(
        `DragonRealms Phoenix - test-character-name (${GameCode.PRIME})`
      );

      expect(mockSettingService.load).toHaveBeenCalledExactlyOnceWith({
        profileNames: ['default', `test-character-name${GameCode.PRIME}`],
        mode: 'replace',
      });

      expect(mockLichStartProcess).not.toHaveBeenCalled();

      expect(mockSgeService.constructorSpy).toHaveBeenCalledWith([
        {
          username: 'test-account-name',
          password: 'test-account-password',
          gameCode: GameCode.PRIME,
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
        gameCode: GameCode.PRIME,
      });
    });

    it('starts lich process when lich preference is enabled', async () => {
      mockPreferenceService.get.mockImplementation((key) => {
        switch (key) {
          case PreferenceKey.LICH_ENABLED:
            return true;
        }
      });

      mockLichStartProcess.mockResolvedValue({
        host: 'test-lich-host',
        port: 4242,
      });

      const handler = playCharacterHandler({
        dispatch: mockIpcDispatcher,
        accountService: mockAccountService,
        window: mockWindow,
        settingService: mockSettingService,
      });

      await handler([
        {
          accountName: 'test-account-name',
          characterName: 'test-character-name',
          gameCode: GameCode.PRIME,
        },
      ]);

      expect(mockLichStartProcess).toHaveBeenCalledWith({
        gameCode: GameCode.PRIME,
      });

      expect(mockGameInstance.newInstance).toHaveBeenCalledWith({
        credentials: {
          host: 'test-lich-host',
          port: 4242,
          accessToken: 'test-access-token',
        },
      });
    });

    it('dispatches styled text when the stream emits text', async () => {
      const handler = playCharacterHandler({
        dispatch: mockIpcDispatcher,
        accountService: mockAccountService,
        window: mockWindow,
        settingService: mockSettingService,
      });

      await handler([
        {
          accountName: 'test-account-name',
          characterName: 'test-character-name',
          gameCode: GameCode.PRIME,
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

      await vi.runAllTimersAsync();

      expect(mockIpcDispatcher).toHaveBeenCalledWith('game:event', {
        gameEvent: {
          type: GameEventType.STYLED_TEXT,
          eventId: 'test-event-id',
          text: 'test-text',
          segments: [
            {
              text: 'test-text',
              start: 0,
              end: 9,
              foregroundColor: '',
              backgroundColor: '',
            },
          ],
        },
      });
    });

    it('dispatches an error event when the stream errors', async () => {
      const handler = playCharacterHandler({
        dispatch: mockIpcDispatcher,
        accountService: mockAccountService,
        window: mockWindow,
        settingService: mockSettingService,
      });

      await handler([
        {
          accountName: 'test-account-name',
          characterName: 'test-character-name',
          gameCode: GameCode.PRIME,
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
        window: mockWindow,
        settingService: mockSettingService,
      });

      await handler([
        {
          accountName: 'test-account-name',
          characterName: 'test-character-name',
          gameCode: GameCode.PRIME,
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
        gameCode: GameCode.PRIME,
      });
    });

    it('throws an error if the account is not found', async () => {
      mockAccountService.getAccount.mockReset();

      const handler = playCharacterHandler({
        dispatch: mockIpcDispatcher,
        accountService: mockAccountService,
        window: mockWindow,
        settingService: mockSettingService,
      });

      try {
        await handler([
          {
            accountName: 'test-account-name',
            characterName: 'test-character-name',
            gameCode: GameCode.PRIME,
          },
        ]);
        expect.unreachable('it should throw an error');
      } catch (error) {
        expect(mockIpcDispatcher).toHaveBeenCalledTimes(0);
        expect(mockWindow.setTitle).not.toHaveBeenCalled();
        expect(mockSettingService.load).not.toHaveBeenCalled();
        expect(mockSgeService.loginCharacter).not.toHaveBeenCalled();
        expect(mockGameInstance.newInstance).not.toHaveBeenCalled();
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
