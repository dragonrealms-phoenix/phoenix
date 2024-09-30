import type { Mocked } from 'vitest';
import { vi } from 'vitest';
import type { GameSocket } from '../types.js';

export class GameSocketMockImpl implements Mocked<GameSocket> {
  constructorSpy = vi.fn();

  constructor(...args: Array<any>) {
    this.constructorSpy(args);
  }

  isConnected = vi.fn<GameSocket['isConnected']>();
  connect = vi.fn<GameSocket['connect']>();
  disconnect = vi.fn<GameSocket['disconnect']>();
  send = vi.fn<GameSocket['send']>();
}
