import type { Mocked } from 'vitest';
import { vi } from 'vitest';
import type { GameService } from '../types.js';

export class GameServiceMockImpl implements Mocked<GameService> {
  constructorSpy = vi.fn();

  constructor(...args: Array<any>) {
    this.constructorSpy(args);
  }

  isConnected = vi.fn<GameService['isConnected']>();
  connect = vi.fn<GameService['connect']>();
  disconnect = vi.fn<GameService['disconnect']>();
  send = vi.fn<GameService['send']>();
}
