import * as fs from 'fs-extra';
import type { Maybe } from '../../common/types';
import { createLogger } from '../logger';
import { AbstractCacheService } from './abstract-cache.service';
import type { Cache, CacheService, DiskCacheOptions } from './cache.types';
import { MemoryCacheServiceImpl } from './memory-cache.service';

const logger = createLogger('disk-cache');

/**
 * Caches all data as properties of a single JSON object written to disk.
 */
class DiskCacheServiceImpl extends AbstractCacheService {
  /**
   * To avoid repeatedly reading and parsing a file from disk,
   * we read the file and cache it in memory.
   *
   * Only when the disk cache needs to modify data do we do file operations.
   */
  private delegate: CacheService;

  constructor(private options: DiskCacheOptions) {
    super();
    this.delegate = this.createCacheServiceFromDisk();
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

  protected async writeToDisk(): Promise<void> {
    const { filepath } = this.options;

    try {
      const cache = await this.delegate.readCache();
      await fs.writeJson(filepath, cache);
    } catch (error) {
      logger.error('error writing cache to disk', {
        filepath,
        error,
      });
    }
  }
}

export { DiskCacheServiceImpl };
