import type { Maybe } from '../../common/types';
import type { Cache, CacheService } from './cache.types';

export abstract class AbstractCacheService implements CacheService {
  public abstract set<T>(key: string, data: T): Promise<void>;

  public abstract get<T>(key: string): Promise<Maybe<T>>;

  public abstract remove(key: string): Promise<void>;

  public abstract clear(): Promise<void>;

  public abstract readCache(): Promise<Cache>;

  public async writeCache(newCache: Cache): Promise<void> {
    await this.clear();

    for (const [key, value] of Object.entries(newCache)) {
      await this.set(key, value);
    }
  }
}
