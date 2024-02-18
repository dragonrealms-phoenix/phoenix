import { afterEach } from 'node:test';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SGEGameCredentials } from '../../sge/types.js';
import { GameServiceImpl } from '../game.service.js';
import type { GameService } from '../types.js';

const { mockGameService } = vi.hoisted(() => {
  const mockGameService = {
    connect: vi.fn<
      Parameters<GameService['connect']>,
      ReturnType<GameService['connect']>
    >(),

    disconnect: vi.fn<
      Parameters<GameService['disconnect']>,
      ReturnType<GameService['disconnect']>
    >(),

    send: vi.fn<
      Parameters<GameService['send']>,
      ReturnType<GameService['send']>
    >(),
  };

  return {
    mockGameService,
  };
});

vi.mock('../game.service.js', () => {
  class GameServiceMockImpl implements GameService {
    connect = vi
      .fn<
        Parameters<GameService['connect']>,
        ReturnType<GameService['connect']>
      >()
      .mockImplementation(async () => {
        return mockGameService.connect();
      });

    disconnect = vi
      .fn<
        Parameters<GameService['disconnect']>,
        ReturnType<GameService['disconnect']>
      >()
      .mockImplementation(async () => {
        return mockGameService.disconnect();
      });

    send = vi
      .fn<Parameters<GameService['send']>, ReturnType<GameService['send']>>()
      .mockImplementation((command) => {
        return mockGameService.send(command);
      });
  }

  return {
    GameServiceImpl: GameServiceMockImpl,
  };
});

describe('game-instance', () => {
  let credentials: SGEGameCredentials;

  beforeEach(() => {
    credentials = {
      accessToken: 'test-access-token',
      host: 'test-host',
      port: 1234,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#newInstance', () => {
    it('gets a new game instance', async () => {
      const Game = (await import('../game.instance.js')).Game;
      const instance = await Game.newInstance({ credentials });

      expect(instance).toBeInstanceOf(GameServiceImpl);
    });

    it('disconnects from the existing game instance', async () => {
      const Game = (await import('../game.instance.js')).Game;
      const instance1 = await Game.newInstance({ credentials });
      const instance2 = await Game.newInstance({ credentials });

      expect(instance1.disconnect).toHaveBeenCalledTimes(1);
      expect(instance2.disconnect).toHaveBeenCalledTimes(0);
    });
  });

  describe('#getInstance', () => {
    it('gets the current instance', async () => {
      const Game = (await import('../game.instance.js')).Game;
      const instance = await Game.newInstance({ credentials });

      expect(Game.getInstance()).toBe(instance);
    });

    it('returns undefined if no instance has been created', async () => {
      // Reset the module so that its local `instance` variable is unset.
      vi.resetModules();

      const Game = (await import('../game.instance.js')).Game;

      expect(Game.getInstance()).toBe(undefined);
    });
  });
});
