import type { Mock } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockLogger } from '../../logger/__mocks__/logger.factory.js';
import { IpcController } from '../ipc.controller.js';

const {
  mockGameInstance,
  mockGameService,
  mockAccountService,
  mockLayoutService,
  mockIpcMain,
  mockIpcPingHandler,
  mockIpcLogHandler,
  mockIpcSaveAccountHandler,
  mockIpcRemoveAccountHandler,
  mockIpcListAccountsHandler,
  mockIpcSaveCharacterHandler,
  mockIpcRemoveCharacterHandler,
  mockIpcListCharactersHandler,
  mockIpcPlayCharacterHandler,
  mockIpcQuitCharacterHandler,
  mockIpcGetLayoutHandler,
  mockIpcListLayoutNamesHandler,
  mockIpcSaveLayoutHandler,
  mockIpcDeleteLayoutHandler,
  mockIpcSendCommandHandler,
} = await vi.hoisted(async () => {
  const mockGameInstanceModule = await import(
    '../../game/__mocks__/game-instance.mock.js'
  );
  const mockGameInstance = new mockGameInstanceModule.GameInstanceMock();

  const mockGameServiceModule = await import(
    '../../game/__mocks__/game-service.mock.js'
  );
  const mockGameService = new mockGameServiceModule.GameServiceMockImpl();

  const mockAccountServiceModule = await import(
    '../../account/__mocks__/account-service.mock.js'
  );
  const mockAccountService =
    new mockAccountServiceModule.AccountServiceMockImpl();

  const mockLayoutServiceModule = await import(
    '../../layout/__mocks__/layout-service.mock.js'
  );
  const mockLayoutService = new mockLayoutServiceModule.LayoutServiceMockImpl();

  const mockIpcMainModule = await import('../__mocks__/ipc-main.mock.js');
  const mockIpcMain = new mockIpcMainModule.IpcMainMock();

  const mockIpcPingHandler = vi.fn();
  const mockIpcLogHandler = vi.fn();
  const mockIpcSaveAccountHandler = vi.fn();
  const mockIpcRemoveAccountHandler = vi.fn();
  const mockIpcListAccountsHandler = vi.fn();
  const mockIpcSaveCharacterHandler = vi.fn();
  const mockIpcRemoveCharacterHandler = vi.fn();
  const mockIpcListCharactersHandler = vi.fn();
  const mockIpcPlayCharacterHandler = vi.fn();
  const mockIpcQuitCharacterHandler = vi.fn();
  const mockIpcGetLayoutHandler = vi.fn();
  const mockIpcListLayoutNamesHandler = vi.fn();
  const mockIpcSaveLayoutHandler = vi.fn();
  const mockIpcDeleteLayoutHandler = vi.fn();
  const mockIpcSendCommandHandler = vi.fn();

  return {
    mockGameInstance,
    mockGameService,
    mockAccountService,
    mockLayoutService,
    mockIpcMain,
    mockIpcPingHandler,
    mockIpcLogHandler,
    mockIpcSaveAccountHandler,
    mockIpcRemoveAccountHandler,
    mockIpcListAccountsHandler,
    mockIpcSaveCharacterHandler,
    mockIpcRemoveCharacterHandler,
    mockIpcListCharactersHandler,
    mockIpcPlayCharacterHandler,
    mockIpcQuitCharacterHandler,
    mockIpcGetLayoutHandler,
    mockIpcListLayoutNamesHandler,
    mockIpcSaveLayoutHandler,
    mockIpcDeleteLayoutHandler,
    mockIpcSendCommandHandler,
  };
});

vi.mock('../../game/game.instance.js', () => {
  return {
    Game: mockGameInstance,
  };
});

vi.mock('../../ipc/handlers/ping.js', () => {
  return {
    pingHandler: mockIpcPingHandler,
  };
});

vi.mock('../../ipc/handlers/log.js', () => {
  return {
    logHandler: mockIpcLogHandler,
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

vi.mock('../../ipc/handlers/list-accounts.js', () => {
  return {
    listAccountsHandler: mockIpcListAccountsHandler,
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

vi.mock('../../ipc/handlers/quit-character.js', () => {
  return {
    quitCharacterHandler: mockIpcQuitCharacterHandler,
  };
});

vi.mock('../../ipc/handlers/get-layout.js', () => {
  return {
    getLayoutHandler: mockIpcGetLayoutHandler,
  };
});

vi.mock('../../ipc/handlers/list-layout-names.js', () => {
  return {
    listLayoutNamesHandler: mockIpcListLayoutNamesHandler,
  };
});

vi.mock('../../ipc/handlers/save-layout.js', () => {
  return {
    saveLayoutHandler: mockIpcSaveLayoutHandler,
  };
});

vi.mock('../../ipc/handlers/delete-layout.js', () => {
  return {
    deleteLayoutHandler: mockIpcDeleteLayoutHandler,
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

vi.mock('../../logger/logger.factory.ts');

describe('ipc-controller', () => {
  let mockIpcDispatcher: Mock;

  beforeEach(() => {
    mockIpcDispatcher = vi.fn();

    mockIpcPingHandler.mockReturnValue(vi.fn());
    mockIpcLogHandler.mockReturnValue(vi.fn());
    mockIpcSaveAccountHandler.mockReturnValue(vi.fn());
    mockIpcRemoveAccountHandler.mockReturnValue(vi.fn());
    mockIpcListAccountsHandler.mockReturnValue(vi.fn());
    mockIpcSaveCharacterHandler.mockReturnValue(vi.fn());
    mockIpcRemoveCharacterHandler.mockReturnValue(vi.fn());
    mockIpcListCharactersHandler.mockReturnValue(vi.fn());
    mockIpcPlayCharacterHandler.mockReturnValue(vi.fn());
    mockIpcQuitCharacterHandler.mockReturnValue(vi.fn());
    mockIpcGetLayoutHandler.mockReturnValue(vi.fn());
    mockIpcListLayoutNamesHandler.mockReturnValue(vi.fn());
    mockIpcSaveLayoutHandler.mockReturnValue(vi.fn());
    mockIpcDeleteLayoutHandler.mockReturnValue(vi.fn());
    mockIpcSendCommandHandler.mockReturnValue(vi.fn());

    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#IpcController', () => {
    describe('#constructor', () => {
      it('registers channel handlers', async () => {
        const controller = new IpcController({
          dispatch: mockIpcDispatcher,
          accountService: mockAccountService,
          layoutService: mockLayoutService,
        });

        expect(controller).toBeInstanceOf(IpcController);

        // Creates handler registry

        expect(mockIpcPingHandler).toHaveBeenCalledWith({
          dispatch: mockIpcDispatcher,
        });

        expect(mockIpcLogHandler).toHaveBeenCalledWith({
          logger: mockLogger,
        });

        expect(mockIpcSaveAccountHandler).toHaveBeenCalledWith({
          accountService: mockAccountService,
        });

        expect(mockIpcRemoveAccountHandler).toHaveBeenCalledWith({
          accountService: mockAccountService,
        });

        expect(mockIpcListAccountsHandler).toHaveBeenCalledWith({
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

        expect(mockIpcQuitCharacterHandler).toHaveBeenCalledWith({
          dispatch: mockIpcDispatcher,
        });

        expect(mockIpcGetLayoutHandler).toHaveBeenCalledWith({
          layoutService: mockLayoutService,
        });

        expect(mockIpcListLayoutNamesHandler).toHaveBeenCalledWith({
          layoutService: mockLayoutService,
        });

        expect(mockIpcSaveLayoutHandler).toHaveBeenCalledWith({
          layoutService: mockLayoutService,
        });

        expect(mockIpcDeleteLayoutHandler).toHaveBeenCalledWith({
          layoutService: mockLayoutService,
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
          'listAccounts',
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
          'quitCharacter',
          expect.any(Function)
        );

        expect(handleChannelSpy).toHaveBeenCalledWith(
          'getLayout',
          expect.any(Function)
        );

        expect(handleChannelSpy).toHaveBeenCalledWith(
          'listLayoutNames',
          expect.any(Function)
        );

        expect(handleChannelSpy).toHaveBeenCalledWith(
          'saveLayout',
          expect.any(Function)
        );

        expect(handleChannelSpy).toHaveBeenCalledWith(
          'deleteLayout',
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
            layoutService: mockLayoutService,
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
          layoutService: mockLayoutService,
        });

        await controller.destroy();

        const removeChannelSpy = mockIpcMain.unsubscribeFromChannelSpy;
        expect(removeChannelSpy).toHaveBeenCalledWith('ping');
        expect(removeChannelSpy).toHaveBeenCalledWith('log');
        expect(removeChannelSpy).toHaveBeenCalledWith('saveAccount');
        expect(removeChannelSpy).toHaveBeenCalledWith('removeAccount');
        expect(removeChannelSpy).toHaveBeenCalledWith('listAccounts');
        expect(removeChannelSpy).toHaveBeenCalledWith('saveCharacter');
        expect(removeChannelSpy).toHaveBeenCalledWith('removeCharacter');
        expect(removeChannelSpy).toHaveBeenCalledWith('listCharacters');
        expect(removeChannelSpy).toHaveBeenCalledWith('playCharacter');
        expect(removeChannelSpy).toHaveBeenCalledWith('quitCharacter');
        expect(removeChannelSpy).toHaveBeenCalledWith('getLayout');
        expect(removeChannelSpy).toHaveBeenCalledWith('listLayoutNames');
        expect(removeChannelSpy).toHaveBeenCalledWith('saveLayout');
        expect(removeChannelSpy).toHaveBeenCalledWith('deleteLayout');
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
          layoutService: mockLayoutService,
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
          layoutService: mockLayoutService,
        });

        await expect(mockIpcMain.invokeChannel('ping')).rejects.toEqual(
          new Error(`[IPC:CHANNEL:ERROR:PING] test-error`)
        );
      });
    });
  });
});
