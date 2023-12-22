import { app } from 'electron';
import path from 'node:path';
import type { Maybe } from '../../common/types';
import type { CacheService, DiskCacheOptions } from '../cache';
import { DiskCacheServiceImpl } from '../cache';
import type { StoreService } from './store.types';

/**
 * Simple file-backed store for storing key-value pairs.
 */
class StoreServiceImpl implements StoreService {
  private cacheService: CacheService;

  constructor(options: DiskCacheOptions) {
    this.cacheService = new DiskCacheServiceImpl(options);
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

// There is exactly one store instance so that it's
// easy anywhere in the app to get/set config values.
// One place to manage the config file location.
const storeInstance = new StoreServiceImpl({
  filepath: path.join(app.getPath('userData'), 'config.json'),
});

const Store = {
  getInstance: (): StoreService => {
    return storeInstance;
  },
};

export { Store };
