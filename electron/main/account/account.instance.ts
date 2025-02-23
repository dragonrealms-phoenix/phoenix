import { app } from 'electron';
import path from 'node:path';
import { DiskCacheServiceImpl } from '../cache/disk-cache.service.js';
import { AccountServiceImpl } from './account.service.js';

// There is exactly one account instance so that it's
// easy anywhere in the app to manage accounts and characters.
export const Accounts = new AccountServiceImpl({
  cacheService: new DiskCacheServiceImpl({
    filePath: path.join(app.getPath('userData'), 'accounts.json'),
  }),
});
