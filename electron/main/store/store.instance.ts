import { app } from 'electron';
import path from 'node:path';
import { DiskCacheServiceImpl } from '../cache/disk-cache.service.js';
import { StoreServiceImpl } from './store.service.js';

// There is exactly one store instance so that it's
// easy anywhere in the app to get/set config values.
// One place to manage the config file location.
export const Store = new StoreServiceImpl({
  cacheService: new DiskCacheServiceImpl({
    filepath: path.join(app.getPath('userData'), 'config.json'),
  }),
});
