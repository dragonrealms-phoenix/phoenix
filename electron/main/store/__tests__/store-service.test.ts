import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryCacheServiceImpl } from '../../cache/memory-cache.service.js';
import { StoreServiceImpl } from '../store.service.js';
import type { StoreService } from '../types.js';

describe('store-service', () => {
  let storeService: StoreService;

  beforeEach(async () => {
    storeService = new StoreServiceImpl({
      cacheService: new MemoryCacheServiceImpl(),
    });
  });

  afterEach(async () => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe('#keys', () => {
    it('returns empty array if no keys', async () => {
      const keys = await storeService.keys();
      expect(keys).toEqual([]);
    });

    it('returns keys', async () => {
      await storeService.set('key1', 'value1');
      await storeService.set('key2', 'value2');
      const keys = await storeService.keys();
      expect(keys).toEqual(['key1', 'key2']);
    });
  });

  describe('#get', () => {
    it('returns undefined if key not found', async () => {
      const value = await storeService.get('key1');
      expect(value).toBeUndefined();
    });

    it('returns value if key found', async () => {
      await storeService.set('key1', 'value1');
      const value = await storeService.get('key1');
      expect(value).toEqual('value1');
    });
  });

  describe('#set', () => {
    it('sets the value for the given key', async () => {
      await storeService.set('key1', 'value1');
      const value = await storeService.get('key1');
      expect(value).toEqual('value1');
    });

    it('overwrites the existing value for the given key', async () => {
      await storeService.set('key1', 'value1');
      await storeService.set('key1', 'value2');
      const value = await storeService.get('key1');
      expect(value).toEqual('value2');
    });

    it('removes the value for the given key if value is null', async () => {
      await storeService.set('key1', 'value1');
      await storeService.set('key1', null);
      const value = await storeService.get('key1');
      expect(value).toBeUndefined();
    });

    it('removes the value for the given key if value is undefined', async () => {
      await storeService.set('key1', 'value1');
      await storeService.set('key1', undefined);
      const value = await storeService.get('key1');
      expect(value).toBeUndefined();
    });
  });

  describe('#remove', () => {
    it('removes the value for the given key', async () => {
      await storeService.set('key1', 'value1');
      await storeService.remove('key1');
      const value = await storeService.get('key1');
      expect(value).toBeUndefined();
    });
  });

  describe('#removeAll', () => {
    it('removes all keys and values', async () => {
      await storeService.set('key1', 'value1');
      await storeService.set('key2', 'value2');
      await storeService.removeAll();
      const keys = await storeService.keys();
      expect(keys).toEqual([]);
    });
  });
});
