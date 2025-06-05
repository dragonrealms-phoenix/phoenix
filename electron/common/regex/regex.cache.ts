const regexCache: { [key: string]: RegExp } = {};

/**
 * Returns a RegExp object from the cache or creates a new one.
 * Caches regex objects based on their pattern and flags combination.
 *
 * Note, RegExp objects are stateful. Don't use them concurrently.
 * Also, since the most likely use case when calling this method is
 * to get a regex to run to find matches, this method resets the `lastIndex`
 * back to zero so that it searches from the start of the text you provide.
 * Otherwise when you call `exec` it may start midway through the text.
 */
export const getCachedRegExp = (pattern: string, flags: string): RegExp => {
  const cacheKey = `${pattern}_${flags}`;
  regexCache[cacheKey] ||= new RegExp(pattern, flags);
  regexCache[cacheKey].lastIndex = 0;
  return regexCache[cacheKey];
};
