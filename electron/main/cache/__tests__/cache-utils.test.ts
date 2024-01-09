import type { CacheService } from '../cache.types';
import { getCacheValue } from '../cache.utils';
import { MemoryCacheServiceImpl } from '../memory-cache.service';

describe('cache-utils', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    cacheService = new MemoryCacheServiceImpl();
  });

  describe('#getCacheValue', () => {
    test('when cache miss and no callback then return undefined', async () => {
      expect(await cacheService.get('mykey')).toBeUndefined();

      const value = await getCacheValue({
        cacheService,
        key: 'mykey',
      });

      expect(value).toBeUndefined();
    });

    test('when cache miss and yes callback then returns callback value', async () => {
      expect(await cacheService.get('mykey')).toBeUndefined();

      const value = await getCacheValue({
        cacheService,
        key: 'mykey',
        onCacheMiss: async () => 'cacheMiss',
      });

      expect(value).toEqual('cacheMiss');

      expect(await cacheService.get('mykey')).toEqual('cacheMiss');
    });

    test('when cache hit then return it regardless of callback', async () => {
      await cacheService.set('mykey', 'cacheHit');

      expect(await cacheService.get('mykey')).toEqual('cacheHit');

      const value = await getCacheValue({
        cacheService,
        key: 'mykey',
        onCacheMiss: async () => 'cacheMiss',
      });

      expect(value).toEqual('cacheHit');

      expect(await cacheService.get('mykey')).toEqual('cacheHit');
    });
  });
});
