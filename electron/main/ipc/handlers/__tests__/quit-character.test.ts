import type { Mocked } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
      mockGameInstance.getInstance.mockReturnValueOnce(mockGameService);

      const mockIpcDispatcher = vi.fn();

      const handler = quitCharacterHandler({
        dispatch: mockIpcDispatcher,
      });

      await handler([]);

      expect(mockIpcDispatcher).toHaveBeenCalledWith('game:command', {
        command: 'quit',
      });

      expect(mockGameService.disconnect).toHaveBeenCalledTimes(1);
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
