import type { Maybe } from '../../common/types.js';
import type { CacheService } from '../cache/types.js';
import type { StoreService } from './types.js';

/**
 * Persistence layer for storing key/value pairs.
 * Abstraction over *how* the data is stored.
 */
export class StoreServiceImpl implements StoreService {
  private cacheService: CacheService;

  constructor(options: { cacheService: CacheService }) {
    this.cacheService = options.cacheService;
  }

  public async keys(): Promise<Array<string>> {
    return Object.keys(await this.cacheService.readCache());
  }

  public async get<T>(key: string): Promise<Maybe<T>> {
    return this.cacheService.get<T>(key);
  }

  public async set<T>(key: string, value: T): Promise<void> {
    if (value === null || value === undefined) {
      return this.remove(key);
    }
    await this.cacheService.set(key, value);
  }

  public async remove(key: string): Promise<void> {
    await this.cacheService.remove(key);
  }

  public async removeAll(): Promise<void> {
    await this.cacheService.clear();
  }
}
