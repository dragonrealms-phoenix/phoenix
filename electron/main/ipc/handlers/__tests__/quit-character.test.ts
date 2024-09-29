import type { Mocked } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockCreateLogger } from '../../../../common/__mocks__/create-logger.mock.js';
import { mockElectronLogMain } from '../../../../common/__mocks__/electron-log.mock.js';
import type { Logger } from '../../../../common/logger/types.js';
import { runInBackground } from '../../../async/run-in-background.js';
import { GameServiceMockImpl } from '../../../game/__mocks__/game-service.mock.js';
import { quitCharacterHandler } from '../quit-character.js';

type GameInstanceModule = typeof import('../../../game/game.instance.js');

const { mockGameInstance } = await vi.hoisted(async () => {
  const mockGameInstance: Mocked<GameInstanceModule['Game']> = {
    getInstance: vi.fn(),
    newInstance: vi.fn(),
  };

  return {
    mockGameInstance,
  };
});

vi.mock('../../../game/game.instance.js', () => {
  return {
    Game: mockGameInstance,
  };
});

describe('quit-character', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = mockCreateLogger({
      logger: mockElectronLogMain,
    });
  });

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#quitCharacterhandler', async () => {
    it('quits playing character with the game instance', async () => {
      const mockGameService = new GameServiceMockImpl();
      mockGameService.isConnected.mockReturnValueOnce(true);

      mockGameInstance.getInstance.mockReturnValueOnce(mockGameService);

      const mockIpcDispatcher = vi.fn();

      const handler = quitCharacterHandler({
        dispatch: mockIpcDispatcher,
      });

      // Run the handler in the background so that we can
      // advance the mock timers for a speedier test.
      // Normally, this handler waits a second between its actions.
      runInBackground(async () => {
        await handler([]);
      });

      await vi.advanceTimersToNextTimerAsync();

      expect(mockIpcDispatcher).toHaveBeenCalledWith('game:command', {
        command: 'quit',
      });

      expect(mockGameService.send).toHaveBeenCalledWith('quit');

      expect(mockGameService.disconnect).toHaveBeenCalledTimes(1);
    });

    it('skips sending quit command if game instance is disconnected', async () => {
      const logInfoSpy = vi.spyOn(logger, 'info');

      const mockGameService = new GameServiceMockImpl();
      mockGameService.isConnected.mockReturnValueOnce(false);

      mockGameInstance.getInstance.mockReturnValueOnce(mockGameService);

      const mockIpcDispatcher = vi.fn();

      const handler = quitCharacterHandler({
        dispatch: mockIpcDispatcher,
      });

      await handler([]);

      expect(logInfoSpy).toHaveBeenCalledWith(
        'game instance not connected, skipping send command',
        {
          command: 'quit',
        }
      );

      expect(mockIpcDispatcher).not.toHaveBeenCalled();

      expect(mockGameService.send).not.toHaveBeenCalled();

      expect(mockGameService.disconnect).not.toHaveBeenCalled();
    });

    it('throws error if game instance not found', async () => {
      mockGameInstance.getInstance.mockReturnValueOnce(undefined);

      const mockIpcDispatcher = vi.fn();

      const handler = quitCharacterHandler({
        dispatch: mockIpcDispatcher,
      });

      try {
        await handler([]);
        expect.unreachable('it should throw an error');
      } catch (error) {
        expect(mockIpcDispatcher).toHaveBeenCalledTimes(0);
        expect(error).toEqual(
          new Error('[IPC:QUIT_CHARACTER:ERROR:GAME_INSTANCE_NOT_FOUND]')
        );
      }
    });
  });
});
