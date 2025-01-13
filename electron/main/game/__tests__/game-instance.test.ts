import { afterEach } from 'node:test';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SGEGameCredentials } from '../../sge/types.js';
import { GameServiceMockImpl } from '../__mocks__/game-service.mock.js';
import { GameServiceImpl } from '../game.service.js';

vi.mock('../game.service.js', () => {
  return {
    GameServiceImpl: GameServiceMockImpl,
  };
});

vi.mock('../../logger/logger.factory.ts');

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
