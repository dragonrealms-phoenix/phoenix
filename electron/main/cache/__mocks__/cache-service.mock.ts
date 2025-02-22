import type { Mocked } from 'vitest';
import { vi } from 'vitest';
import type { Maybe } from '../../../common/types.js';
import type { CacheService } from '../types.js';

export class CacheServiceMock implements Mocked<CacheService> {
  set = vi.fn<CacheService['set']>();
  get = vi.fn<(key: string) => Maybe<any>>();
  remove = vi.fn<CacheService['remove']>();
  clear = vi.fn<CacheService['clear']>();
  readCache = vi.fn<CacheService['readCache']>();
  writeCache = vi.fn<CacheService['writeCache']>();
}
