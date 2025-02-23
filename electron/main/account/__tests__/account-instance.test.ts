import { afterEach, describe, expect, it, vi } from 'vitest';
import { AccountServiceImpl } from '../account.service.js';

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

describe('account-instance', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  it('is an account service', async () => {
    const { Accounts } = await import('../account.instance.js');

    expect(Accounts).toBeInstanceOf(AccountServiceImpl);

    expect(mockCacheServiceConstructorSpy).toHaveBeenCalledWith({
      filePath: 'userData/accounts.json',
    });
  });
});
