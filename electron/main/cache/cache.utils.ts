import type { Maybe } from '../../common/types';
import type { CacheService } from './cache.types';

/**
 * Gets a value from the cache service with option
 * to provide your own function to generate a value
 * on cache miss. The generated value will be cached.
 *
 * A cache miss occurs when the value in the cache
 * for the given key comes back as `undefined`.
 */
export async function getCacheValue<T>(options: {
  cacheService: CacheService;
  key: string;
  onCacheMiss: () => Promise<T>;
}): Promise<T>; // callback returns a value so this method returns a value

export async function getCacheValue<T>(options: {
  cacheService: CacheService;
  key: string;
  onCacheMiss: () => Promise<Maybe<T>>;
}): Promise<Maybe<T>>; // callback may or may not return a value so unsure

export async function getCacheValue<T>(options: {
  cacheService: CacheService;
  key: string;
}): Promise<Maybe<T>>; // no callback, so cache may or may not have value

export async function getCacheValue<T>(options: {
  cacheService: CacheService;
  key: string;
  onCacheMiss?: () => Promise<Maybe<T>>;
}): Promise<Maybe<T>> {
  const { cacheService, key, onCacheMiss } = options;

  let value = await cacheService.get<T>(key);

  if (value !== undefined) {
    return value;
  }

  if (onCacheMiss) {
    value = await onCacheMiss();
    if (value !== undefined) {
      await cacheService.set<T>(key, value);
    }
  }

  return value;
}
