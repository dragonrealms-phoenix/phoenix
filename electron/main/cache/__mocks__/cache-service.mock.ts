import type { Mocked } from 'vitest';
import { vi } from 'vitest';
import type { CacheService } from '../types.js';

export class CacheServiceMock implements Mocked<CacheService> {
  set = vi.fn();
  get = vi.fn();
  remove = vi.fn();
  clear = vi.fn();
  readCache = vi.fn();
  writeCache = vi.fn();
}
