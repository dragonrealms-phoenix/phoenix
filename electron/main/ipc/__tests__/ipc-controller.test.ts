import type { Mock, Mocked } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Maybe } from '../../../common/types.js';
import { AccountServiceMockImpl } from '../../account/__mocks__/account-service.mock.js';
import type { AccountService } from '../../account/types.js';
import type { GameService } from '../../game/types.js';
import type { StoreService } from '../../store/types.js';
import { IpcController, newIpcController } from '../ipc.controller.js';

type GameInstanceModule = typeof import('../../game/game.instance.js');
type MockAccountService = Mocked<AccountService> & { constructorSpy: Mock };

const {
  mockGameService,
  mockGameInstance,
  mockAccountService,
  mockStoreService,
  mockIpcPingHandler,
  mockIpcSaveAccountHandler,
  mockIpcRemoveAccountHandler,
  mockIpcSaveCharacterHandler,
  mockIpcRemoveCharacterHandler,
  mockIpcListCharactersHandler,
  mockIpcPlayCharacterHandler,
  mockIpcSendCommandHandler,
  mockIpcMain,
} = await vi.hoisted(async () => {
  const mockGameService: Mocked<GameService> = {
    isConnected: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    send: vi.fn(),
  };

  const mockGameInstance: Mocked<GameInstanceModule['Game']> = {
    getInstance: vi.fn(),
    newInstance: vi.fn(),
  };

  const mockAccountService: MockAccountService = {
    constructorSpy: vi.fn(),

    listAccounts: vi.fn<AccountService['listAccounts']>(),
    getAccount: vi.fn<AccountService['getAccount']>(),
    saveAccount: vi.fn<AccountService['saveAccount']>(),
    removeAccount: vi.fn<AccountService['removeAccount']>(),
    listCharacters: vi.fn<AccountService['listCharacters']>(),
    getCharacter: vi.fn<AccountService['getCharacter']>(),
    saveCharacter: vi.fn<AccountService['saveCharacter']>(),
    removeCharacter: vi.fn<AccountService['removeCharacter']>(),
  };

  const mockStoreService: Mocked<StoreService> = {
    keys: vi.fn<StoreService['keys']>(),
    get: vi.fn<(key: string) => Promise<Maybe<any>>>(),
    set: vi.fn<StoreService['set']>(),
    remove: vi.fn<StoreService['remove']>(),
    removeAll: vi.fn<StoreService['removeAll']>(),
  };

  const mockIpcPingHandler = vi.fn();
  const mockIpcSaveAccountHandler = vi.fn();
  const mockIpcRemoveAccountHandler = vi.fn();
  const mockIpcSaveCharacterHandler = vi.fn();
  const mockIpcRemoveCharacterHandler = vi.fn();
  const mockIpcListCharactersHandler = vi.fn();
  const mockIpcPlayCharacterHandler = vi.fn();
  const mockIpcSendCommandHandler = vi.fn();

  const mockIpcMainModule = await import('../__mocks__/ipc-main.mock.js');
  const mockIpcMain = new mockIpcMainModule.IpcMainMock();

  return {
    mockGameService,
    mockGameInstance,
    mockAccountService,
    mockStoreService,
    mockIpcPingHandler,
    mockIpcSaveAccountHandler,
    mockIpcRemoveAccountHandler,
    mockIpcSaveCharacterHandler,
    mockIpcRemoveCharacterHandler,
    mockIpcListCharactersHandler,
    mockIpcPlayCharacterHandler,
    mockIpcSendCommandHandler,
    mockIpcMain,
  };
});

vi.mock('../../game/game.instance.js', () => {
  return {
    Game: mockGameInstance,
  };
});

vi.mock('../../account/account.service.js', () => {
  class AccountServiceMockImpl implements AccountService {
    constructor(...args: Array<any>) {
      mockAccountService.constructorSpy(args);
    }

    listAccounts = vi
      .fn<AccountService['listAccounts']>()
      .mockImplementation(async () => {
        return mockAccountService.listAccounts();
      });

    getAccount = vi
      .fn<AccountService['getAccount']>()
      .mockImplementation(async (options) => {
        return mockAccountService.getAccount(options);
      });

    saveAccount = vi
      .fn<AccountService['saveAccount']>()
      .mockImplementation(async (account) => {
        return mockAccountService.saveAccount(account);
      });

    removeAccount = vi
      .fn<AccountService['removeAccount']>()
      .mockImplementation(async (options) => {
        return mockAccountService.removeAccount(options);
      });

    listCharacters = vi
      .fn<AccountService['listCharacters']>()
      .mockImplementation(async (options) => {
        return mockAccountService.listCharacters(options);
      });

    getCharacter = vi
      .fn<AccountService['getCharacter']>()
      .mockImplementation(async (options) => {
        return mockAccountService.getCharacter(options);
      });

    saveCharacter = vi
      .fn<AccountService['saveCharacter']>()
      .mockImplementation(async (character) => {
        return mockAccountService.saveCharacter(character);
      });

    removeCharacter = vi
      .fn<AccountService['removeCharacter']>()
      .mockImplementation(async (character) => {
        return mockAccountService.removeCharacter(character);
      });
  }

  return {
    AccountServiceImpl: AccountServiceMockImpl,
  };
});

vi.mock('../../store/store.instance.ts', () => {
  return { Store: mockStoreService };
});

vi.mock('../../ipc/handlers/ping.js', () => {
  return {
    pingHandler: mockIpcPingHandler,
  };
});

vi.mock('../../ipc/handlers/save-account.js', () => {
  return {
    saveAccountHandler: mockIpcSaveAccountHandler,
  };
});

vi.mock('../../ipc/handlers/remove-account.js', () => {
  return {
    removeAccountHandler: mockIpcRemoveAccountHandler,
  };
});

vi.mock('../../ipc/handlers/save-character.js', () => {
  return {
    saveCharacterHandler: mockIpcSaveCharacterHandler,
  };
});

vi.mock('../../ipc/handlers/remove-character.js', () => {
  return {
    removeCharacterHandler: mockIpcRemoveCharacterHandler,
  };
});

vi.mock('../../ipc/handlers/list-characters.js', () => {
  return {
    listCharactersHandler: mockIpcListCharactersHandler,
  };
});

vi.mock('../../ipc/handlers/play-character.js', () => {
  return {
    playCharacterHandler: mockIpcPlayCharacterHandler,
  };
});

vi.mock('../../ipc/handlers/send-command.js', () => {
  return {
    sendCommandHandler: mockIpcSendCommandHandler,
  };
});

vi.mock('electron', () => {
  return {
    ipcMain: mockIpcMain,
  };
});

describe('ipc-controller', () => {
  let mockIpcDispatcher: Mock;

  beforeEach(() => {
    mockIpcDispatcher = vi.fn();

    mockIpcPingHandler.mockReturnValue(vi.fn());
    mockIpcSaveAccountHandler.mockReturnValue(vi.fn());
    mockIpcRemoveAccountHandler.mockReturnValue(vi.fn());
    mockIpcSaveCharacterHandler.mockReturnValue(vi.fn());
    mockIpcRemoveCharacterHandler.mockReturnValue(vi.fn());
    mockIpcListCharactersHandler.mockReturnValue(vi.fn());
    mockIpcPlayCharacterHandler.mockReturnValue(vi.fn());
    mockIpcSendCommandHandler.mockReturnValue(vi.fn());

    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#newIpcController', () => {
    it('creates a new ipc controller with default account service', async () => {
      const controller = newIpcController({
        dispatch: mockIpcDispatcher,
      });

      expect(controller).toBeInstanceOf(IpcController);
      expect(mockAccountService.constructorSpy).toHaveBeenCalledWith([
        {
          storeService: mockStoreService,
        },
      ]);
    });

    it('creates a new ipc controller with specific account service', async () => {
      const customAccountService = new AccountServiceMockImpl();

      const controller = newIpcController({
        dispatch: mockIpcDispatcher,
        accountService: customAccountService,
      });

      expect(controller).toBeInstanceOf(IpcController);
      expect(mockAccountService.constructorSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe('#IpcController', () => {
    describe('#constructor', () => {
      it('registers channel handlers', async () => {
        const controller = new IpcController({
          dispatch: mockIpcDispatcher,
          accountService: mockAccountService,
        });

        expect(controller).toBeInstanceOf(IpcController);

        // Creates handler registry

        expect(mockIpcPingHandler).toHaveBeenCalledWith({
          dispatch: mockIpcDispatcher,
        });

        expect(mockIpcSaveAccountHandler).toHaveBeenCalledWith({
          accountService: mockAccountService,
        });

        expect(mockIpcRemoveAccountHandler).toHaveBeenCalledWith({
          accountService: mockAccountService,
        });

        expect(mockIpcSaveCharacterHandler).toHaveBeenCalledWith({
          accountService: mockAccountService,
        });

        expect(mockIpcRemoveCharacterHandler).toHaveBeenCalledWith({
          accountService: mockAccountService,
        });

        expect(mockIpcListCharactersHandler).toHaveBeenCalledWith({
          accountService: mockAccountService,
        });

        expect(mockIpcPlayCharacterHandler).toHaveBeenCalledWith({
          dispatch: mockIpcDispatcher,
          accountService: mockAccountService,
        });

        expect(mockIpcSendCommandHandler).toHaveBeenCalledWith({
          dispatch: mockIpcDispatcher,
        });

        // Adds listeners to ipc channels

        const handleChannelSpy = mockIpcMain.subscribeToChannelSpy;
        expect(handleChannelSpy).toHaveBeenCalledWith(
          'ping',
          expect.any(Function)
        );

        expect(handleChannelSpy).toHaveBeenCalledWith(
          'saveAccount',
          expect.any(Function)
        );

        expect(handleChannelSpy).toHaveBeenCalledWith(
          'removeAccount',
          expect.any(Function)
        );

        expect(handleChannelSpy).toHaveBeenCalledWith(
          'saveCharacter',
          expect.any(Function)
        );

        expect(handleChannelSpy).toHaveBeenCalledWith(
          'removeCharacter',
          expect.any(Function)
        );

        expect(handleChannelSpy).toHaveBeenCalledWith(
          'listCharacters',
          expect.any(Function)
        );

        expect(handleChannelSpy).toHaveBeenCalledWith(
          'playCharacter',
          expect.any(Function)
        );

        expect(handleChannelSpy).toHaveBeenCalledWith(
          'sendCommand',
          expect.any(Function)
        );
      });

      it('throws an error if a channel has no handler', async () => {
        mockIpcPingHandler.mockReset(); // will return undefined

        try {
          new IpcController({
            dispatch: mockIpcDispatcher,
            accountService: mockAccountService,
          });
          expect.unreachable('it should throw an error');
        } catch (error) {
          expect(error).toEqual(
            new Error(`[IPC:CHANNEL:ERROR:HANDLER_NOT_FOUND] ping`)
          );
        }
      });
    });

    describe('#destroy', () => {
      it('removes handlers and disconnects game instance', async () => {
        mockGameInstance.getInstance.mockReturnValue(mockGameService);

        const controller = new IpcController({
          dispatch: mockIpcDispatcher,
          accountService: mockAccountService,
        });

        await controller.destroy();

        const removeChannelSpy = mockIpcMain.unsubscribeFromChannelSpy;
        expect(removeChannelSpy).toHaveBeenCalledWith('ping');
        expect(removeChannelSpy).toHaveBeenCalledWith('saveAccount');
        expect(removeChannelSpy).toHaveBeenCalledWith('removeAccount');
        expect(removeChannelSpy).toHaveBeenCalledWith('saveCharacter');
        expect(removeChannelSpy).toHaveBeenCalledWith('removeCharacter');
        expect(removeChannelSpy).toHaveBeenCalledWith('listCharacters');
        expect(removeChannelSpy).toHaveBeenCalledWith('playCharacter');
        expect(removeChannelSpy).toHaveBeenCalledWith('sendCommand');

        expect(mockGameService.disconnect).toHaveBeenCalledTimes(1);
      });
    });

    describe('ipcMain.handle', () => {
      it('returns the value returned by the handler', async () => {
        mockIpcPingHandler.mockReturnValue(
          vi.fn().mockResolvedValueOnce('pong')
        );

        new IpcController({
          dispatch: mockIpcDispatcher,
          accountService: mockAccountService,
        });

        await expect(mockIpcMain.invokeChannel('ping')).resolves.toEqual(
          'pong'
        );
      });

      it('throws an error if the handler errors', async () => {
        mockIpcPingHandler.mockReturnValue(
          vi.fn().mockRejectedValueOnce(new Error('test-error'))
        );

        new IpcController({
          dispatch: mockIpcDispatcher,
          accountService: mockAccountService,
        });

        await expect(mockIpcMain.invokeChannel('ping')).rejects.toEqual(
          new Error(`[IPC:CHANNEL:ERROR:PING] test-error`)
        );
      });
    });
  });
});
