import { app } from 'electron';
import path from 'node:path';
import { getStoreForPath } from '../store/store.instance.js';
import { PreferenceServiceImpl } from './preference.service.js';

// There is exactly one preference service instance so that it's
// easy anywhere in the app to get/set preference values.
export const Preferences = new PreferenceServiceImpl({
  storeService: getStoreForPath(
    path.join(app.getPath('userData'), 'preferences.json')
  ),
});
