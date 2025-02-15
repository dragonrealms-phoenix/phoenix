import { DiskCacheServiceImpl } from '../cache/disk-cache.service.js';
import { StoreServiceImpl } from './store.service.js';
import type { StoreService } from './types.js';

const storesByPath: Record<string, StoreService> = {};

export const getStoreForPath = (filepath: string): StoreService => {
  if (!storesByPath[filepath]) {
    storesByPath[filepath] = new StoreServiceImpl({
      cacheService: new DiskCacheServiceImpl({
        filepath,
      }),
    });
  }
  return storesByPath[filepath];
};
