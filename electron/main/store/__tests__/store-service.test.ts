import { merge } from 'lodash';
import { StoreServiceImpl } from '../store.service';
import type { StoreService } from '../store.types';

jest.mock('../../cache', () => {
  const actualModule = jest.requireActual('../../cache');
  return merge({}, actualModule, {
    DiskCacheServiceImpl: actualModule.MemoryCacheServiceImpl,
  });
});

describe('store-service', () => {
  let storeService: StoreService;

  beforeEach(async () => {
    storeService = new StoreServiceImpl({ filepath: 'test' });
    // We mocked the cache module and swapped out the disk-cache for
    // memory-cache, so we need to remove all the keys from the cache
    // because the constructor arg populated the cache with 'filepath' key.
    await storeService.removeAll();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('#keys', () => {
    it('should return empty array if no keys', async () => {
      const keys = await storeService.keys();
      expect(keys).toEqual([]);
    });

    it('should return keys', async () => {
      await storeService.set('key1', 'value1');
      await storeService.set('key2', 'value2');
      const keys = await storeService.keys();
      expect(keys).toEqual(['key1', 'key2']);
    });
  });

  describe('#get', () => {
    it('should return undefined if key not found', async () => {
      const value = await storeService.get('key1');
      expect(value).toBeUndefined();
    });

    it('should return value if key found', async () => {
      await storeService.set('key1', 'value1');
      const value = await storeService.get('key1');
      expect(value).toEqual('value1');
    });
  });

  describe('#set', () => {
    it('should set the value for the given key', async () => {
      await storeService.set('key1', 'value1');
      const value = await storeService.get('key1');
      expect(value).toEqual('value1');
    });

    it('should overwrite the existing value for the given key', async () => {
      await storeService.set('key1', 'value1');
      await storeService.set('key1', 'value2');
      const value = await storeService.get('key1');
      expect(value).toEqual('value2');
    });

    it('should remove the value for the given key if value is null', async () => {
      await storeService.set('key1', 'value1');
      await storeService.set('key1', null);
      const value = await storeService.get('key1');
      expect(value).toBeUndefined();
    });

    it('should remove the value for the given key if value is undefined', async () => {
      await storeService.set('key1', 'value1');
      await storeService.set('key1', undefined);
      const value = await storeService.get('key1');
      expect(value).toBeUndefined();
    });
  });

  describe('#remove', () => {
    it('should remove the value for the given key', async () => {
      await storeService.set('key1', 'value1');
      await storeService.remove('key1');
      const value = await storeService.get('key1');
      expect(value).toBeUndefined();
    });
  });

  describe('#removeAll', () => {
    it('should remove all keys and values', async () => {
      await storeService.set('key1', 'value1');
      await storeService.set('key2', 'value2');
      await storeService.removeAll();
      const keys = await storeService.keys();
      expect(keys).toEqual([]);
    });
  });
});
