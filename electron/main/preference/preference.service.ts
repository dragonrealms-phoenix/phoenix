import type { Maybe } from '../../common/types';
import { Store, type StoreService } from '../store';
import type {
  PreferenceKey,
  PreferenceKeyToTypeMap,
  PreferenceService,
} from './preference.types';

class PreferenceServiceImpl implements PreferenceService {
  private storeService: StoreService;

  constructor(options: { storeService: StoreService }) {
    this.storeService = options.storeService;
  }

  public async get<K extends PreferenceKey>(
    key: K
  ): Promise<Maybe<PreferenceKeyToTypeMap[K]>> {
    return this.storeService.get(key);
  }

  public async set<K extends PreferenceKey, V = PreferenceKeyToTypeMap[K]>(
    key: K,
    value: V
  ): Promise<void> {
    await this.storeService.set(key, value);
  }

  public async remove(key: PreferenceKey): Promise<void> {
    await this.storeService.remove(key);
  }
}

// There is exactly one preference service instance so that it's
// easy anywhere in the app to get/set preference values.
export const Preferences = new PreferenceServiceImpl({
  storeService: Store.getInstance(),
});
