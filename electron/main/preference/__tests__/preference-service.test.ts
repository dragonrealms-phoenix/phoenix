import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StoreServiceMock } from '../../store/__mocks__/store-service.mock.js';
import { PreferenceServiceImpl } from '../preference.service.js';
import type { PreferenceKey, PreferenceService } from '../types.js';

describe('preference-service', () => {
  let storeService: StoreServiceMock;
  let preferenceService: PreferenceService;

  beforeEach(() => {
    storeService = new StoreServiceMock();

    storeService.get.mockImplementation((key: string) => {
      if (key === 'key') {
        return 'value';
      }
      return undefined;
    });

    preferenceService = new PreferenceServiceImpl({
      storeService,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe('#get', () => {
    it('returns value if key found', async () => {
      const value = await preferenceService.get('key' as PreferenceKey);
      expect(value).toEqual('value');
      expect(storeService.get).toHaveBeenCalledWith('key');
    });

    it('returns undefined if key not found', async () => {
      const value = await preferenceService.get('test' as PreferenceKey);
      expect(value).toBeUndefined();
      expect(storeService.get).toHaveBeenCalledWith('test');
    });
  });

  describe('#set', () => {
    it('sets value', async () => {
      await preferenceService.set('key' as PreferenceKey, 'value');
      expect(storeService.set).toHaveBeenCalledWith('key', 'value');
    });
  });

  describe('#remove', () => {
    it('removes value', async () => {
      await preferenceService.remove('key' as PreferenceKey);
      expect(storeService.remove).toHaveBeenCalledWith('key');
    });
  });
});
