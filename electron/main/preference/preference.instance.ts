import { app } from 'electron';
import path from 'node:path';
import { DiskCacheServiceImpl } from '../cache/disk-cache.service.js';
import { PreferenceServiceImpl } from './preference.service.js';

// There is exactly one preference service instance so that it's
// easy anywhere in the app to get/set preference values.
export const Preferences = new PreferenceServiceImpl({
  cacheService: new DiskCacheServiceImpl({
    filePath: path.join(app.getPath('userData'), 'preferences.json'),
  }),
});
