import type { Mock, Mocked } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AccountServiceMockImpl } from '../../account/__mocks__/account-service.mock.js';
import type { AccountService } from '../../account/types.js';
import type { StoreService } from '../../store/types.js';
import { IpcController, newIpcController } from '../ipc.controller.js';

type GameInstanceModule = typeof import('../../game/game.instance.js');
type MockAccountService = Mocked<AccountService> & { constructorSpy: Mock };

const {
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
} = vi.hoisted(() => {
  const mockGameInstance: Mocked<GameInstanceModule['Game']> = {
    getInstance: vi.fn(),
    newInstance: vi.fn(),
  };

  const mockAccountService: MockAccountService = {
    constructorSpy: vi.fn(),

    listAccounts: vi.fn<
      Parameters<AccountService['listAccounts']>,
      ReturnType<AccountService['listAccounts']>
    >(),

    getAccount: vi.fn<
      Parameters<AccountService['getAccount']>,
      ReturnType<AccountService['getAccount']>
    >(),

    saveAccount: vi.fn<
      Parameters<AccountService['saveAccount']>,
      ReturnType<AccountService['saveAccount']>
    >(),

    removeAccount: vi.fn<
      Parameters<AccountService['removeAccount']>,
      ReturnType<AccountService['removeAccount']>
    >(),

    listCharacters: vi.fn<
      Parameters<AccountService['listCharacters']>,
      ReturnType<AccountService['listCharacters']>
    >(),

    getCharacter: vi.fn<
      Parameters<AccountService['getCharacter']>,
      ReturnType<AccountService['getCharacter']>
    >(),

    saveCharacter: vi.fn<
      Parameters<AccountService['saveCharacter']>,
      ReturnType<AccountService['saveCharacter']>
    >(),

    removeCharacter: vi.fn<
      Parameters<AccountService['removeCharacter']>,
      ReturnType<AccountService['removeCharacter']>
    >(),
  };

  const mockStoreService: Mocked<StoreService> = {
    keys: vi.fn<[], Promise<Array<string>>>(),
    get: vi.fn<[string], Promise<any>>(),
    set: vi.fn<[string, any], Promise<void>>(),
    remove: vi.fn<[string], Promise<void>>(),
    removeAll: vi.fn<[], Promise<void>>(),
  };

  const mockIpcPingHandler = vi.fn();
  const mockIpcSaveAccountHandler = vi.fn();
  const mockIpcRemoveAccountHandler = vi.fn();
  const mockIpcSaveCharacterHandler = vi.fn();
  const mockIpcRemoveCharacterHandler = vi.fn();
  const mockIpcListCharactersHandler = vi.fn();
  const mockIpcPlayCharacterHandler = vi.fn();
  const mockIpcSendCommandHandler = vi.fn();

  const mockIpcMain = {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  };

  return {
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

vi.mock('../../../game/game.instance.js', () => {
  return {
    Game: mockGameInstance,
  };
});

vi.mock('../../account/account.service.js', () => {
  class AccountServiceMockImpl implements AccountService {
    constructor(...args: Array<any>) {
      console.log('**** mock account service impl', { args });
      mockAccountService.constructorSpy(args);
    }

    listAccounts = vi
      .fn<
        Parameters<AccountService['listAccounts']>,
        ReturnType<AccountService['listAccounts']>
      >()
      .mockImplementation(async () => {
        return mockAccountService.listAccounts();
      });

    getAccount = vi
      .fn<
        Parameters<AccountService['getAccount']>,
        ReturnType<AccountService['getAccount']>
      >()
      .mockImplementation(async (options) => {
        return mockAccountService.getAccount(options);
      });

    saveAccount = vi
      .fn<
        Parameters<AccountService['saveAccount']>,
        ReturnType<AccountService['saveAccount']>
      >()
      .mockImplementation(async (account) => {
        return mockAccountService.saveAccount(account);
      });

    removeAccount = vi
      .fn<
        Parameters<AccountService['removeAccount']>,
        ReturnType<AccountService['removeAccount']>
      >()
      .mockImplementation(async (options) => {
        return mockAccountService.removeAccount(options);
      });

    listCharacters = vi
      .fn<
        Parameters<AccountService['listCharacters']>,
        ReturnType<AccountService['listCharacters']>
      >()
      .mockImplementation(async (options) => {
        return mockAccountService.listCharacters(options);
      });

    getCharacter = vi
      .fn<
        Parameters<AccountService['getCharacter']>,
        ReturnType<AccountService['getCharacter']>
      >()
      .mockImplementation(async (options) => {
        return mockAccountService.getCharacter(options);
      });

    saveCharacter = vi
      .fn<
        Parameters<AccountService['saveCharacter']>,
        ReturnType<AccountService['saveCharacter']>
      >()
      .mockImplementation(async (character) => {
        return mockAccountService.saveCharacter(character);
      });

    removeCharacter = vi
      .fn<
        Parameters<AccountService['removeCharacter']>,
        ReturnType<AccountService['removeCharacter']>
      >()
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

    it('creates a new ipc controller with specified account service', async () => {
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
    let controller: IpcController;

    beforeEach(() => {
      controller = new IpcController({
        dispatch: mockIpcDispatcher,
        accountService: mockAccountService,
      });
    });

    describe('#constructor', () => {
      it('registers ipc handlers', async () => {
        expect(controller).toBeInstanceOf(IpcController);

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
      });

      it.todo('throws an error if a channel has no handler', async () => {
        // Assert throws an error if a channel has no handler.
      });
    });

    describe('#destroy', () => {
      it.todo('todo', async () => {
        // Assert calls `ipcMain.removeHandler` for each handler registered.
        // Assert calls `Game.getInstance()?.disconnect()`
      });
    });

    describe('ipcMain.handle', () => {
      it.todo('todo', async () => {
        // Assert calling `ipcMain.handle` returns a value if handler resolves.
        // Assert calling `ipcMain.handle` throws an error if handler rejects.
      });
    });
  });
});
