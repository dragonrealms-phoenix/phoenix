import { afterEach, describe, expect, it, vi } from 'vitest';
import { StoreServiceImpl } from '../store.service.js';

const { DiskCacheServiceImpl } = await vi.hoisted(async () => {
  const cacheServiceMockModule = await import(
    '../../cache/__mocks__/cache-service.mock.js'
  );

  return {
    DiskCacheServiceImpl: cacheServiceMockModule.CacheServiceMock,
  };
});

vi.mock('../../cache/disk-cache.service.js', () => {
  return { DiskCacheServiceImpl };
});

vi.mock('electron', async () => {
  return {
    app: {
      getPath: vi.fn().mockReturnValue('userData'),
    },
  };
});

describe('store-instance', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  it('is a store service', async () => {
    const Store = (await import('../store.instance.js')).Store;
    expect(Store).toBeInstanceOf(StoreServiceImpl);
  });
});
