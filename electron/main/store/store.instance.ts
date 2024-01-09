// There is exactly one store instance so that it's
// easy anywhere in the app to get/set config values.

import { app } from 'electron';
import * as path from 'node:path';
import { StoreServiceImpl } from './store.service';
import type { StoreService } from './store.types';

// One place to manage the config file location.
const storeInstance = new StoreServiceImpl({
  filepath: path.join(app.getPath('userData'), 'config.json'),
});

export const Store = {
  /**
   * Get the current store instance.
   * Use it to get/set config values.
   */
  getInstance: (): StoreService => {
    return storeInstance;
  },
};
