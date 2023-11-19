import { app, safeStorage } from 'electron';
import path from 'node:path';
import { isNil } from 'lodash';
import type { CacheService } from '../cache';
import { DiskCacheServiceImpl } from '../cache';
import { createLogger } from '../logger';
import type { StoreService, StoreSetOptions, StoredValue } from './store.types';

const logger = createLogger('store');

/**
 * Simple file-backed store for storing key-value pairs.
 */
class StoreServiceImpl implements StoreService {
  private cacheService: CacheService;

  constructor(options: { filepath: string }) {
    this.cacheService = new DiskCacheServiceImpl({
      filepath: options.filepath,
    });
  }

  public async get<T>(key: string): Promise<T | undefined> {
    const storedValue = await this.cacheService.get<StoredValue<T>>(key);

    if (storedValue?.encrypted) {
      const safeValueHex = storedValue.value;
      const safeValueBytes = Buffer.from(safeValueHex, 'hex');
      const safeValueJson = safeStorage.decryptString(safeValueBytes);
      try {
        return JSON.parse(safeValueJson) as T;
      } catch (error) {
        logger.error('failed to parse stored value', { key, error });
        return undefined;
      }
    }

    return storedValue?.value;
  }

  public async set<T>(
    key: string,
    value: T,
    options?: StoreSetOptions
  ): Promise<void> {
    const { encrypted = false } = options ?? {};

    if (isNil(value)) {
      return this.remove(key);
    }

    let valueToStore: StoredValue<T>;

    if (encrypted) {
      const safeValueJson = JSON.stringify(value);
      const safeValueBytes = safeStorage.encryptString(safeValueJson);
      const safeValueHex = safeValueBytes.toString('hex');
      valueToStore = {
        encrypted,
        value: safeValueHex,
      };
    } else {
      valueToStore = {
        encrypted,
        value,
      };
    }

    await this.cacheService.set(key, valueToStore);
  }

  public async remove(key: string): Promise<void> {
    await this.cacheService.remove(key);
  }
}

// There is exactly one store instance so that it's
// easy anywhere in the app to get/set config values.
const store = new StoreServiceImpl({
  filepath: path.join(app.getPath('userData'), 'config.json'),
});

export { store };
