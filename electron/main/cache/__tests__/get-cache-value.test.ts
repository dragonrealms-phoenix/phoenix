import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCacheValue } from '../get-cache-value.js';
import { MemoryCacheServiceImpl } from '../memory-cache.service.js';
import type { CacheService } from '../types.js';

describe('get-cache-value', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    cacheService = new MemoryCacheServiceImpl();
  });

  it('returns undefined on cache miss when no callback', async () => {
    expect(await cacheService.get('mykey')).toBeUndefined();

    const value = await getCacheValue({
      cacheService,
      key: 'mykey',
    });

    expect(value).toBeUndefined();
  });

  it('returns callback value on cache miss when given callback', async () => {
    const onCacheMiss = vi.fn(async () => 'cacheMiss');

    expect(await cacheService.get('mykey')).toBeUndefined();

    const value = await getCacheValue({
      cacheService,
      key: 'mykey',
      onCacheMiss,
    });

    expect(value).toEqual('cacheMiss');
    expect(await cacheService.get('mykey')).toEqual('cacheMiss');
    expect(onCacheMiss).toHaveBeenCalled();
  });

  it('returns cached value and does not invoke callback when cache hit', async () => {
    const onCacheMiss = vi.fn(async () => 'cacheMiss');

    await cacheService.set('mykey', 'cacheHit');

    expect(await cacheService.get('mykey')).toEqual('cacheHit');

    const value = await getCacheValue({
      cacheService,
      key: 'mykey',
      onCacheMiss,
    });

    expect(value).toEqual('cacheHit');
    expect(await cacheService.get('mykey')).toEqual('cacheHit');
    expect(onCacheMiss).not.toHaveBeenCalled();
  });
});
