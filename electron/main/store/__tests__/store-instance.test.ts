import { afterEach, describe, expect, it, vi } from 'vitest';
import { StoreServiceImpl } from '../store.service.js';

const { diskCacheServiceConstructorSpy, mockDiskCacheServiceClass } =
  await vi.hoisted(async () => {
    const cacheServiceMockModule = await import(
      '../../cache/__mocks__/cache-service.mock.js'
    );

    const diskCacheServiceConstructorSpy = vi.fn();
    const mockDiskCacheService = new cacheServiceMockModule.CacheServiceMock();

    return {
      diskCacheServiceConstructorSpy,
      mockDiskCacheServiceClass: class {
        constructor(...args: any) {
          diskCacheServiceConstructorSpy(...args);
          return mockDiskCacheService;
        }
      },
    };
  });

vi.mock('../../cache/disk-cache.service.js', () => {
  return {
    DiskCacheServiceImpl: mockDiskCacheServiceClass,
  };
});

describe('store-instance', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe('#getStoreForPath', () => {
    it('returns a store for a path', async () => {
      const { getStoreForPath } = await import('../store.instance.js');

      const store = getStoreForPath('config.json');

      expect(store).toBeInstanceOf(StoreServiceImpl);

      expect(diskCacheServiceConstructorSpy).toHaveBeenCalledWith({
        filepath: 'config.json',
      });
    });

    it('reuses stores for the same paths', async () => {
      const { getStoreForPath } = await import('../store.instance.js');

      const storeA = getStoreForPath('config.json');
      const storeB = getStoreForPath('config.json');

      expect(storeA).toBe(storeB);
    });

    it('creates new stores for different paths', async () => {
      const { getStoreForPath } = await import('../store.instance.js');

      const storeA = getStoreForPath('pathA.json');
      const storeB = getStoreForPath('pathB.json');

      expect(storeA).not.toBe(storeB);
    });
  });
});
