import { Store } from '../store/store.instance.js';
import { PreferenceServiceImpl } from './preference.service.js';

// There is exactly one preference service instance so that it's
// easy anywhere in the app to get/set preference values.
export const Preferences = new PreferenceServiceImpl({
  storeService: Store,
});
