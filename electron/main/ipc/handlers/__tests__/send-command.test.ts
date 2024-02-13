import type { Mocked } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GameServiceMockImpl } from '../../../game/__mocks__/game-service.mock.js';
import { sendCommandHandler } from '../send-command.js';

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

describe('save-character', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#sendCommandHandler', async () => {
    it('saves a command with the game instance', async () => {
      const mockGameService = new GameServiceMockImpl();
      mockGameInstance.getInstance.mockReturnValueOnce(mockGameService);

      const mockIpcDispatcher = vi.fn();

      const handler = sendCommandHandler({
        dispatch: mockIpcDispatcher,
      });

      await handler(['test-command']);

      expect(mockIpcDispatcher).toHaveBeenCalledWith('game:command', {
        command: 'test-command',
      });
    });

    it('throws error if game instance not found', async () => {
      mockGameInstance.getInstance.mockReturnValueOnce(undefined);

      const mockIpcDispatcher = vi.fn();

      const handler = sendCommandHandler({
        dispatch: mockIpcDispatcher,
      });

      try {
        await handler(['test-command']);
        expect.unreachable('should throw an error');
      } catch (error) {
        expect(mockIpcDispatcher).toHaveBeenCalledTimes(0);
        expect(error).toEqual(
          new Error('[IPC:SEND_COMMAND:ERROR:GAME_INSTANCE_NOT_FOUND]')
        );
      }
    });
  });
});
