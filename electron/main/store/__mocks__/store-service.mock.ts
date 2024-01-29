import { vi } from 'vitest';
import type { StoreService } from '../types.js';

export class StoreServiceMock implements StoreService {
  keys = vi.fn();
  get = vi.fn();
  set = vi.fn();
  remove = vi.fn();
  removeAll = vi.fn();
}
