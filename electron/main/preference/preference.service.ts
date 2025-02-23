import type { Maybe } from '../../common/types.js';
import type { CacheService } from '../cache/types.js';
import { logger } from './logger.js';
import type {
  PreferenceKey,
  PreferenceKeyToTypeMap,
  PreferenceService,
} from './types.js';

export class PreferenceServiceImpl implements PreferenceService {
  private cacheService: CacheService;

  constructor(options: { cacheService: CacheService }) {
    this.cacheService = options.cacheService;
  }

  public get<K extends PreferenceKey, V extends PreferenceKeyToTypeMap[K]>(
    key: K
  ): Maybe<V>;

  public get<K extends PreferenceKey, V extends PreferenceKeyToTypeMap[K]>(
    key: K,
    defaultValue: V
  ): V;

  public get<K extends PreferenceKey, V extends PreferenceKeyToTypeMap[K]>(
    key: K,
    defaultValue?: V
  ): Maybe<V> {
    logger.debug('getting preference', { key, defaultValue });
    const value = this.cacheService.get<V>(key) ?? defaultValue;
    logger.debug('got preference', { key, value });
    return value;
  }

  public set<K extends PreferenceKey, V extends PreferenceKeyToTypeMap[K]>(
    key: K,
    value: V
  ): void {
    logger.debug('setting preference', { key, value });
    this.cacheService.set<V>(key, value);
  }

  public remove(key: PreferenceKey): void {
    logger.debug('removing preference', { key });
    this.cacheService.remove(key);
  }
}
