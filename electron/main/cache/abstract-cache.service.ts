import type { Cache, CacheService } from './cache.types';

abstract class AbstractCacheService implements CacheService {
  public abstract set<T>(key: string | number, data: T): Promise<void>;

  public abstract get<T>(key: string | number): Promise<T | undefined>;

  public abstract remove(key: string | number): Promise<void>;

  public abstract clear(): Promise<void>;

  public abstract readCache(): Promise<Cache>;

  public async writeCache(newCache: Cache): Promise<void> {
    await this.clear();

    for (const [key, value] of Object.entries(newCache)) {
      await this.set(key, value);
    }
  }
}

export { AbstractCacheService };
