import type { Maybe } from '../../common/types.js';
import { AbstractCacheService } from './abstract-cache.service.js';
import type { Cache } from './types.js';

/**
 * Caches all data as properties of a single JSON object stored in memory.
 */
export class MemoryCacheServiceImpl extends AbstractCacheService {
  constructor(private cache: Cache = {}) {
    super();
  }

  public set<T>(key: string, item: T): void {
    this.cache[key] = item;
  }

  public get<T>(key: string): Maybe<T> {
    return this.cache[key];
  }

  public remove(key: string): void {
    delete this.cache[key];
  }

  public clear(): void {
    this.cache = {};
  }

  public readCache(): Cache {
    return this.cache;
  }
}
