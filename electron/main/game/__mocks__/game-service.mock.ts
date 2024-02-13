import { vi } from 'vitest';
import type { GameService } from '../types.js';

export class GameServiceMockImpl implements GameService {
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
