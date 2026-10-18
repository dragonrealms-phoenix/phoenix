import fs from 'fs-extra';
import { sleep } from '../../common/async/async.utils.js';
import type { Maybe } from '../../common/types.js';
import { AbstractCacheService } from './abstract-cache.service.js';
import { logger } from './logger.js';
import { MemoryCacheServiceImpl } from './memory-cache.service.js';
import type {
  Cache,
  CacheService,
  DiskCacheOptions,
  DiskCacheService,
} from './types.js';

/**
 * Caches all data as properties of a single JSON object written to disk.
 * Uses an in-memory cache buffer to provide synchronous access to data.
 * Writes to disk occur in the background and may not flush immediately.
 */
export class DiskCacheServiceImpl
  extends AbstractCacheService
  implements DiskCacheService
{
  /**
   * To avoid repeatedly reading and parsing a file from disk,
   * we read the file and cache it in memory.
   *
   * Only when the disk cache needs to modify data do we do file operations.
   */
  private delegate: CacheService;

  /**
   * Where to store the cache on disk.
   */
  private filePath: string;

  /**
   * The number of milliseconds to wait between writes to disk.
   */
  private writeInterval: number;

  /**
   * Is a write operation currently pending?
   */
  private pendingWrite: boolean;

  /**
   * Unix timestamp when we last wrote to disk.
   * This is used with the write interval to know
   * how long to delay consecutive writes to optimize IO.
   */
  private lastWriteTime: number = 0;

  /**
   * We use a promise-chain to ensure sequential writes to disk,
   * and that only one write operation occurs at a time.
   */
  private writeQueue: Promise<void>;

  constructor(options: DiskCacheOptions) {
    super();
    this.filePath = options.filePath;
    this.writeInterval = options.writeInterval ?? 1000;
    this.pendingWrite = false;
    this.writeQueue = Promise.resolve();
    this.delegate = options.delegate ?? new MemoryCacheServiceImpl();
    this.loadFromDisk();
  }

  public override set<T>(key: string, value: T): void {
    this.delegate.set(key, value);
    this.queueWriteToDisk();
  }

  public override get<T>(key: string): Maybe<T> {
    return this.delegate.get(key);
  }

  public override remove(key: string): void {
    this.delegate.remove(key);
    this.queueWriteToDisk();
  }

  public override clear(): void {
    this.delegate.clear();
    this.queueWriteToDisk();
  }

  public override readCache(): Cache {
    return this.delegate.readCache();
  }

  public override writeCache(newCache: Cache): void {
    this.delegate.writeCache(newCache);
    this.queueWriteToDisk();
  }

  public reload(): void {
    this.loadFromDisk();
  }

  // -------------------------------------------------------------------------

  private loadFromDisk(): void {
    const filePath = this.filePath;
    try {
      logger.trace('initializing disk cache', { filePath });
      if (!fs.pathExistsSync(filePath)) {
        fs.writeJsonSync(filePath, {});
      }
      const cache = fs.readJsonSync(filePath);
      this.delegate.writeCache(cache);
    } catch (error) {
      logger.error('error initializing disk cache', {
        filePath,
        error,
      });
    }
  }

  private queueWriteToDisk(): void {
    if (!this.pendingWrite) {
      this.pendingWrite = true;
      this.writeQueue = this.writeQueue.then(() => this.writeToDiskAsync());
    }
  }

  private async writeToDiskAsync(): Promise<void> {
    const filePath = this.filePath;
    try {
      await this.throttleDiskWrite();
      this.pendingWrite = false;
      logger.trace('writing cache to disk', { filePath });
      const cache = this.delegate.readCache();
      await fs.writeJson(filePath, cache, { spaces: 2 });
      logger.trace('wrote cache to disk', { filePath });
    } catch (error) {
      logger.error('error writing cache to disk', {
        filePath,
        error,
      });
    }
  }

  private async throttleDiskWrite(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastWriteTime;
    const delay = Math.max(0, this.writeInterval - elapsed);
    this.lastWriteTime = now + delay;
    await sleep(delay);
  }
}
