import type { Maybe } from '../../common/types';
import { createLogger } from '../logger';
import type { StoreService } from '../store';
import type {
  PreferenceKey,
  PreferenceKeyToTypeMap,
  PreferenceService,
} from './preference.types';

const logger = createLogger('preference:service');

export class PreferenceServiceImpl implements PreferenceService {
  private storeService: StoreService;

  constructor(options: { storeService: StoreService }) {
    this.storeService = options.storeService;
  }

  public async get<K extends PreferenceKey, V = PreferenceKeyToTypeMap[K]>(
    key: K
  ): Promise<Maybe<V>> {
    logger.debug('getting preference', { key });
    const value = await this.storeService.get<V>(key);
    logger.debug('got preference', { key, value });
    return value;
  }

  public async set<K extends PreferenceKey, V = PreferenceKeyToTypeMap[K]>(
    key: K,
    value: V
  ): Promise<void> {
    logger.debug('setting preference', { key, value });
    await this.storeService.set<V>(key, value);
  }

  public async remove(key: PreferenceKey): Promise<void> {
    logger.debug('removing preference', { key });
    await this.storeService.remove(key);
  }
}
