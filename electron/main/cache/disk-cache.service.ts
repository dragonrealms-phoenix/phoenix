import * as fs from 'fs-extra';
import type { DebouncedFunc } from 'lodash';
import debounce from 'lodash/debounce.js';
import type { Maybe } from '../../common/types.js';
import { AbstractCacheService } from './abstract-cache.service.js';
import { logger } from './logger.js';
import { MemoryCacheServiceImpl } from './memory-cache.service.js';
import type { Cache, CacheService, DiskCacheOptions } from './types.js';

/**
 * Caches all data as properties of a single JSON object written to disk.
 */
export class DiskCacheServiceImpl extends AbstractCacheService {
  /**
   * To avoid repeatedly reading and parsing a file from disk,
   * we read the file and cache it in memory.
   *
   * Only when the disk cache needs to modify data do we do file operations.
   */
  private delegate: CacheService;

  /**
   * Debounce writes to disk for performance.
   */
  private writeToDisk: DebouncedFunc<() => Promise<void>>;

  constructor(private options: DiskCacheOptions) {
    super();
    this.delegate = this.createCacheServiceFromDisk();
    this.writeToDisk = this.createDebouncedWriteToDisk();
  }

  private createCacheServiceFromDisk(): CacheService {
    const { filepath } = this.options;

    let cache: Cache = {};

    try {
      if (!fs.pathExistsSync(filepath)) {
        fs.writeJsonSync(filepath, {});
      }
      cache = fs.readJsonSync(filepath);
    } catch (error) {
      logger.error('error initializing disk cache', {
        filepath,
        error,
      });
    }

    return new MemoryCacheServiceImpl(cache);
  }

  private createDebouncedWriteToDisk(): DebouncedFunc<() => Promise<void>> {
    return debounce(async () => {
      await this.writeToDiskNow();
    }, 1000);
  }

  private async writeToDiskNow(): Promise<void> {
    const { filepath } = this.options;
    try {
      const cache = await this.delegate.readCache();
      await fs.writeJson(filepath, cache);
      logger.debug('wrote cache to disk');
    } catch (error) {
      logger.error('error writing cache to disk', {
        filepath,
        error,
      });
    }
  }

  public async set<T>(key: string, item: T): Promise<void> {
    await this.delegate.set(key, item);
    await this.writeToDisk();
  }

  public async get<T>(key: string): Promise<Maybe<T>> {
    return this.delegate.get(key);
  }

  public async remove(key: string): Promise<void> {
    await this.delegate.remove(key);
    await this.writeToDisk();
  }

  public async clear(): Promise<void> {
    await this.delegate.clear();
    await this.writeToDisk();
  }

  public async readCache(): Promise<Cache> {
    return this.delegate.readCache();
  }
}
