import type { ContextBridge, IpcRenderer } from 'electron';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type {
  AccountWithPassword,
  Character,
} from '../../common/account/types.js';
import type { Layout } from '../../common/layout/types.js';
import type { LogMessage } from '../../common/logger/types.js';
import { LogLevel } from '../../common/logger/types.js';

const { mockContextBridge, mockIpcRenderer } = vi.hoisted(() => {
  const mockContextBridge = {
    exposeInMainWorld: vi.fn<ContextBridge['exposeInMainWorld']>(),
  };

  const mockIpcRenderer = {
    send: vi.fn<IpcRenderer['send']>(),
    invoke: vi.fn<IpcRenderer['invoke']>(),
    on: vi.fn<IpcRenderer['on']>(),
    off: vi.fn<IpcRenderer['off']>(),
    removeAllListeners: vi.fn<IpcRenderer['removeAllListeners']>(),
  };

  return {
    mockContextBridge,
    mockIpcRenderer,
  };
});

vi.mock('electron', () => {
  return {
    contextBridge: mockContextBridge,
    ipcRenderer: mockIpcRenderer,
  };
});

describe('index', () => {
  let api: AppAPI;

  beforeAll(async () => {
    mockContextBridge.exposeInMainWorld.mockImplementation(
      (_apiKey: string, apiObj: AppAPI) => {
        api = apiObj;
      }
    );
    await vi.importActual('../index.js');
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#exposeInMainWorld', () => {
    it('exposes appAPI in the main world', async () => {
      expect(mockContextBridge.exposeInMainWorld).toHaveBeenCalledTimes(1);
      expect(mockContextBridge.exposeInMainWorld).toHaveBeenCalledWith(
        'api',
        expect.objectContaining({
          ping: expect.any(Function),
          log: expect.any(Function),
          saveAccount: expect.any(Function),
          removeAccount: expect.any(Function),
          saveCharacter: expect.any(Function),
          removeCharacter: expect.any(Function),
          listCharacters: expect.any(Function),
          playCharacter: expect.any(Function),
          getLayout: expect.any(Function),
          listLayoutNames: expect.any(Function),
          saveLayout: expect.any(Function),
          deleteLayout: expect.any(Function),
          sendCommand: expect.any(Function),
          onMessage: expect.any(Function),
          removeAllListeners: expect.any(Function),
        })
      );
    });
  });

  describe('api', () => {
    describe('#ping', async () => {
      it('invokes ping', async () => {
        mockIpcRenderer.invoke.mockResolvedValueOnce('pong');
        const result = await api.ping();
        expect(result).toBe('pong');
        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('ping');
      });
    });

    describe('#log', async () => {
      it('sends log', async () => {
        const logMessage: LogMessage = {
          level: LogLevel.INFO,
          scope: 'test-scope',
          message: 'test-message',
          timestamp: new Date(),
          data: { test: 'data' },
        };
        await api.log(logMessage);
        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('log', logMessage);
      });
    });

    describe('#saveAccount', async () => {
      const mockAccount: AccountWithPassword = {
        accountName: 'test-account-name',
        accountPassword: 'test-account-password',
      };

      it('invokes saveAccount', async () => {
        await api.saveAccount(mockAccount);
        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
          'saveAccount',
          mockAccount
        );
      });
    });

    describe('#removeAccount', async () => {
      it('invokes removeAccount', async () => {
        await api.removeAccount({
          accountName: 'test-account-name',
        });
        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('removeAccount', {
          accountName: 'test-account-name',
        });
      });
    });

    describe('#saveCharacter', async () => {
      const mockCharacter: Character = {
        accountName: 'test-account-name',
        characterName: 'test-character-name',
        gameCode: 'DR',
      };

      it('invokes saveCharacter', async () => {
        await api.saveCharacter(mockCharacter);
        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
          'saveCharacter',
          mockCharacter
        );
      });
    });

    describe('#removeCharacter', async () => {
      const mockCharacter: Character = {
        accountName: 'test-account-name',
        characterName: 'test-character-name',
        gameCode: 'DR',
      };

      it('invokes removeCharacter', async () => {
        await api.removeCharacter(mockCharacter);
        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
          'removeCharacter',
          mockCharacter
        );
      });
    });

    describe('#listCharacters', async () => {
      const mockCharacter: Character = {
        accountName: 'test-account-name',
        characterName: 'test-character-name',
        gameCode: 'DR',
      };

      it('invokes listCharacters', async () => {
        mockIpcRenderer.invoke.mockResolvedValueOnce([mockCharacter]);
        const result = await api.listCharacters();
        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('listCharacters');
        expect(result).toEqual([mockCharacter]);
      });
    });

    describe('#playCharacter', async () => {
      const mockCharacter: Character = {
        accountName: 'test-account-name',
        characterName: 'test-character-name',
        gameCode: 'DR',
      };

      it('invokes playCharacter', async () => {
        await api.playCharacter(mockCharacter);
        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
          'playCharacter',
          mockCharacter
        );
      });
    });

    describe('#getLayout', async () => {
      const mockLayout: Layout = {
        window: {
          x: 1,
          y: 2,
          width: 3,
          height: 4,
        },
        items: [
          {
            id: 'test-stream-id',
            title: 'test-stream-title',
            visible: true,
            x: 1,
            y: 2,
            width: 3,
            height: 4,
            fontFamily: 'test-text-font',
            fontSize: '12px',
            backgroundColor: 'test-background-color',
            foregroundColor: 'test-foreground-color',
            whenHiddenRedirectToId: '',
          },
        ],
      };

      it('invokes getLayout', async () => {
        mockIpcRenderer.invoke.mockResolvedValueOnce(mockLayout);
        const result = await api.getLayout({
          layoutName: 'test-layout-name',
        });
        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('getLayout', {
          layoutName: 'test-layout-name',
        });
        expect(result).toEqual(mockLayout);
      });
    });

    describe('#listLayoutNames', async () => {
      it('invokes listLayoutNames', async () => {
        mockIpcRenderer.invoke.mockResolvedValueOnce(['test-layout-name']);
        const result = await api.listLayoutNames();
        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('listLayoutNames');
        expect(result).toEqual(['test-layout-name']);
      });
    });

    describe('#saveLayout', async () => {
      const mockLayout: Layout = {
        window: {
          x: 1,
          y: 2,
          width: 3,
          height: 4,
        },
        items: [
          {
            id: 'test-stream-id',
            title: 'test-stream-title',
            visible: true,
            x: 1,
            y: 2,
            width: 3,
            height: 4,
            fontFamily: 'test-text-font',
            fontSize: '12px',
            backgroundColor: 'test-background-color',
            foregroundColor: 'test-foreground-color',
            whenHiddenRedirectToId: '',
          },
        ],
      };

      it('invokes saveLayout', async () => {
        await api.saveLayout({
          layoutName: 'test-layout-name',
          layout: mockLayout,
        });
        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('saveLayout', {
          layoutName: 'test-layout-name',
          layout: mockLayout,
        });
      });
    });

    describe('#deleteLayout', async () => {
      it('invokes deleteLayout', async () => {
        await api.deleteLayout({
          layoutName: 'test-layout-name',
        });
        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('deleteLayout', {
          layoutName: 'test-layout-name',
        });
      });
    });

    describe('#sendCommand', async () => {
      it('invokes sendCommand', async () => {
        await api.sendCommand('test-command');
        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
          'sendCommand',
          'test-command'
        );
      });
    });

    describe('#onMessage', async () => {
      it('invokes on, then off when unsubscribe', async () => {
        const mockListener = vi.fn();

        const unsubscribe = api.onMessage('test-channel', mockListener);
        expect(mockIpcRenderer.on).toHaveBeenCalledWith(
          'test-channel',
          mockListener
        );

        unsubscribe();
        expect(mockIpcRenderer.off).toHaveBeenCalledWith(
          'test-channel',
          mockListener
        );
      });
    });

    describe('#removeAllListeners', async () => {
      it('invokes removeAllListeners', async () => {
        api.removeAllListeners('test-channel');
        expect(mockIpcRenderer.removeAllListeners).toHaveBeenCalledWith(
          'test-channel'
        );
      });
    });
  });
});
