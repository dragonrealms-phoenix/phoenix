import type { Maybe } from '../../common/types';
import { AbstractCacheService } from './abstract-cache.service';
import type { Cache } from './cache.types';

/**
 * Caches all data as properties of a single JSON object stored in memory.
 */
class MemoryCacheServiceImpl extends AbstractCacheService {
  constructor(private cache: Cache = {}) {
    super();
  }

  public async set<T>(key: string, item: T): Promise<void> {
    this.cache[key] = item;
  }

  public async get<T>(key: string): Promise<Maybe<T>> {
    return this.cache[key];
  }

  public async remove(key: string): Promise<void> {
    delete this.cache[key];
  }

  public async clear(): Promise<void> {
    this.cache = {};
  }

  public async readCache(): Promise<Cache> {
    return this.cache;
  }
}

export { MemoryCacheServiceImpl };
