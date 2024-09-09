import { vi } from 'vitest';
import type { GameService } from '../types.js';

export class GameServiceMockImpl implements GameService {
  constructorSpy = vi.fn();

  constructor(...args: Array<any>) {
    this.constructorSpy(args);
  }

  isConnected = vi.fn<[], boolean>();

  connect = vi.fn<
    Parameters<GameService['connect']>,
    ReturnType<GameService['connect']>
  >();

  disconnect = vi.fn<
    Parameters<GameService['disconnect']>,
    ReturnType<GameService['disconnect']>
  >();

  send = vi.fn<
    Parameters<GameService['send']>,
    ReturnType<GameService['send']>
  >();
}
