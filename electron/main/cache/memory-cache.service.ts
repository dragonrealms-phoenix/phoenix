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

  public async set<T>(key: string, item: T): Promise<void> {
    this.setSync(key, item);
  }

  public async get<T>(key: string): Promise<Maybe<T>> {
    return this.getSync(key);
  }

  public async remove(key: string): Promise<void> {
    this.removeSync(key);
  }

  public async clear(): Promise<void> {
    this.clearSync();
  }

  public async readCache(): Promise<Cache> {
    return this.readCacheSync();
  }

  // Since this service operates on in-memory data,
  // there is no need for the operations to be async.
  // However, to conform to the interface, we must.
  // For other use cases this class *can* be used
  // synchronously, and that's what these functions are for.

  public setSync<T>(key: string, item: T): void {
    this.cache[key] = item;
  }

  public getSync<T>(key: string): Maybe<T> {
    return this.cache[key];
  }

  public removeSync(key: string): void {
    delete this.cache[key];
  }

  public clearSync(): void {
    this.cache = {};
  }

  public readCacheSync(): Cache {
    return this.cache;
  }

  public writeCacheSync(newCache: Cache): void {
    this.clearSync();

    for (const [key, value] of Object.entries(newCache)) {
      this.setSync(key, value);
    }
  }
}
