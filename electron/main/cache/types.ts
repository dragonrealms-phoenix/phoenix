import type { Maybe } from '../../common/types.js';

export type Cache = Record<string, any>;

export interface CacheService {
  /**
   * Sets a value for the key in the cache.
   */
  set<T>(key: string | number, value: T): Promise<void>;
  /**
   * Gets a value for the key from the cache.
   */
  get<T>(key: string | number): Promise<Maybe<T>>;
  /**
   * Removes a value for the key from the cache.
   */
  remove(key: string | number): Promise<void>;
  /**
   * Removes all entries from the cache.
   */
  clear(): Promise<void>;
  /**
   * Gets all entries from the cache.
   */
  readCache(): Promise<Cache>;
  /**
   * Replaces the current cache with another one.
   */
  writeCache(newCache: Cache): Promise<void>;
}

export interface DiskCacheOptions {
  /**
   * Path to the file where to store the cache.
   */
  filepath: string;
  /**
   * Interval in milliseconds to write the cache to disk.
   * Reads and writes occur on the delegate cache immediately.
   * This controls how often the in-memory cache is flushed to disk.
   * Default is 1000ms.
   */
  writeInterval?: number;
  /**
   * Delegate cache service to use.
   *
   * Use this to provide an in-memory cache to offload
   * work from reading and writing to disk.
   * Reads and writes occur on the delegate cache immediately,
   * while writes to disk are debounced for performance.
   *
   * The function is called with the initial cache read from disk, if any.
   *
   * This is also helpful in testing by being able to inject a dependency.
   *
   * Default is MemoryCacheServiceImpl.
   */
  createInMemoryCache?: (cache: Cache) => CacheService;
}
