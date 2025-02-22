import type { Mocked } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CacheServiceMockImpl } from '../../cache/__mocks__/cache-service.mock.js';
import type { CacheService } from '../../cache/types.js';
import { PreferenceServiceImpl } from '../preference.service.js';
import type { PreferenceKey, PreferenceService } from '../types.js';

vi.mock('../../logger/logger.factory.ts');

describe('preference-service', () => {
  let mockCacheService: Mocked<CacheService>;
  let preferenceService: PreferenceService;

  beforeEach(() => {
    mockCacheService = new CacheServiceMockImpl();

    mockCacheService.get.mockImplementation((key: string) => {
      if (key === 'key') {
        return 'value';
      }
      return undefined;
    });

    preferenceService = new PreferenceServiceImpl({
      cacheService: mockCacheService,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe('#get', () => {
    it('returns value if key found', async () => {
      const value = preferenceService.get('key' as PreferenceKey);
      expect(value).toEqual('value');
      expect(mockCacheService.get).toHaveBeenCalledWith('key');
    });

    it('returns undefined if key not found', async () => {
      const value = preferenceService.get('test' as PreferenceKey);
      expect(value).toBe(undefined);
      expect(mockCacheService.get).toHaveBeenCalledWith('test');
    });
  });

  describe('#set', () => {
    it('sets value', async () => {
      preferenceService.set('key' as PreferenceKey, 'value');
      expect(mockCacheService.set).toHaveBeenCalledWith('key', 'value');
    });
  });

  describe('#remove', () => {
    it('removes value', async () => {
      preferenceService.remove('key' as PreferenceKey);
      expect(mockCacheService.remove).toHaveBeenCalledWith('key');
    });
  });
});
