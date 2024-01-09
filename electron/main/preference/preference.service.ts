import type { Maybe } from '../../common/types';
import type { StoreService } from '../store';
import type {
  PreferenceKey,
  PreferenceKeyToTypeMap,
  PreferenceService,
} from './preference.types';

export class PreferenceServiceImpl implements PreferenceService {
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
