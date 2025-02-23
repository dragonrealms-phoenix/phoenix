import { afterEach, describe, expect, it, vi } from 'vitest';
import { PreferenceServiceImpl } from '../preference.service.js';

const { mockCacheService, mockCacheServiceConstructorSpy } = await vi.hoisted(
  async () => {
    const cacheServiceMockModule = await import(
      '../../cache/__mocks__/cache-service.mock.js'
    );

    const mockCacheService = new cacheServiceMockModule.CacheServiceMockImpl();

    return {
      mockCacheService,
      mockCacheServiceConstructorSpy: vi.fn(),
    };
  }
);

vi.mock('../../cache/disk-cache.service.js', async () => {
  class MyDiskCacheService {
    constructor(...args: any) {
      mockCacheServiceConstructorSpy(...args);
      return mockCacheService;
    }
  }

  return {
    DiskCacheServiceImpl: MyDiskCacheService,
  };
});

vi.mock('electron', async () => {
  return {
    app: {
      getPath: vi.fn().mockReturnValue('userData'),
    },
  };
});

vi.mock('../../logger/logger.factory.ts');

describe('preference-instance', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  it('is a preference service', async () => {
    const { Preferences } = await import('../preference.instance.js');

    expect(Preferences).toBeInstanceOf(PreferenceServiceImpl);

    expect(mockCacheServiceConstructorSpy).toHaveBeenCalledWith({
      filePath: 'userData/preferences.json',
    });
  });
});
