import type { Maybe } from '../../common/types.js';
import type { Cache, CacheService } from './types.js';

export abstract class AbstractCacheService implements CacheService {
  public abstract set<T>(key: string, data: T): void;

  public abstract get<T>(key: string): Maybe<T>;

  public abstract remove(key: string): void;

  public abstract clear(): void;

  public abstract readCache(): Cache;

  public writeCache(newCache: Cache): void {
    this.clear();

    for (const [key, value] of Object.entries(newCache)) {
      this.set(key, value);
    }
  }
}
