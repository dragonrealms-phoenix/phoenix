import type { Mocked } from 'vitest';
import { vi } from 'vitest';
import type { DiskCacheService } from '../types.js';
import { CacheServiceMockImpl } from './cache-service.mock.js';

export class DiskCacheServiceMockImpl
  extends CacheServiceMockImpl
  implements Mocked<DiskCacheService>
{
  reload = vi.fn<DiskCacheService['reload']>();
}
