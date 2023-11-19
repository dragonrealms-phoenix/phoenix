export type Cache = Record<string, any>;

export interface CacheService {
  /**
   * Sets a value for the key in the cache.
   */
  set<T>(key: string | number, value: T): Promise<void>;
  /**
   * Gets a value for the key from the cache.
   */
  get<T>(key: string | number): Promise<T | undefined>;
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
}
