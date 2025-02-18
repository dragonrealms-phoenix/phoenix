import type { Mocked } from 'vitest';
import { vi } from 'vitest';
import type { Game } from '../game.instance.js';

export class GameInstanceMock implements Mocked<typeof Game> {
  getInstance = vi.fn();
  newInstance = vi.fn();
}
