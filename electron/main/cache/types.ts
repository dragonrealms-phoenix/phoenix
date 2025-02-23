import type { Maybe } from '../../common/types.js';

export type Cache = Record<string, any>;

export interface CacheService {
  /**
   * Sets a value for the key in the cache.
   */
  set<T>(key: string, value: T): void;
  /**
   * Gets a value for the key from the cache.
   */
  get<T>(key: string): Maybe<T>;
  /**
   * Removes a value for the key from the cache.
   */
  remove(key: string): void;
  /**
   * Removes all entries from the cache.
   */
  clear(): void;
  /**
   * Gets all entries from the cache.
   */
  readCache(): Cache;
  /**
   * Replaces the current cache with another one.
   */
  writeCache(newCache: Cache): void;
}

export interface DiskCacheOptions {
  /**
   * Path to the file where to store the cache.
   */
  filePath: string;
  /**
   * Interval in milliseconds to flush the in-memory cache to disk.
   * Default is 1000ms.
   */
  writeInterval?: number;
  /**
   * Cache to use for synchronous storage.
   * All operations occur on this delegate first,
   * then periodically flushed to disk.
   */
  delegate?: CacheService;
}
