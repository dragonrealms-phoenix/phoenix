import type { ContextBridge, IpcRenderer } from 'electron';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

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
        type LogMessage = Parameters<AppAPI['log']>[0];
        const logMessage: LogMessage = {
          level: 'info',
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
      it('invokes saveAccount', async () => {
        await api.saveAccount({
          accountName: 'test-account-name',
          accountPassword: 'test-account-password',
        });
        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('saveAccount', {
          accountName: 'test-account-name',
          accountPassword: 'test-account-password',
        });
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
      it('invokes saveCharacter', async () => {
        await api.saveCharacter({
          accountName: 'test-account-name',
          characterName: 'test-character-name',
          gameCode: 'DR',
        });
        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('saveCharacter', {
          accountName: 'test-account-name',
          characterName: 'test-character-name',
          gameCode: 'DR',
        });
      });
    });

    describe('#removeCharacter', async () => {
      it('invokes removeCharacter', async () => {
        await api.removeCharacter({
          accountName: 'test-account-name',
          characterName: 'test-character-name',
          gameCode: 'DR',
        });
        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('removeCharacter', {
          accountName: 'test-account-name',
          characterName: 'test-character-name',
          gameCode: 'DR',
        });
      });
    });

    describe('#listCharacters', async () => {
      it('invokes listCharacters', async () => {
        mockIpcRenderer.invoke.mockResolvedValueOnce([
          {
            accountName: 'test-account-name',
            characterName: 'test-character-name',
            gameCode: 'DR',
          },
        ]);
        const result = await api.listCharacters();
        expect(result).toEqual([
          {
            accountName: 'test-account-name',
            characterName: 'test-character-name',
            gameCode: 'DR',
          },
        ]);
      });
    });

    describe('#playCharacter', async () => {
      it('invokes playCharacter', async () => {
        await api.playCharacter({
          accountName: 'test-account-name',
          characterName: 'test-character-name',
          gameCode: 'DR',
        });
        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('playCharacter', {
          accountName: 'test-account-name',
          characterName: 'test-character-name',
          gameCode: 'DR',
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
