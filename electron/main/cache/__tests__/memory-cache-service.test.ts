import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryCacheServiceImpl } from '../memory-cache.service.js';

describe('memory-cache-service', () => {
  let cacheService: MemoryCacheServiceImpl;

  beforeEach(() => {
    cacheService = new MemoryCacheServiceImpl();
  });

  describe('async', () => {
    it('set/get/remove - primitive', async () => {
      await cacheService.set('key', 42);
      expect(await cacheService.get('key')).toEqual(42);

      await cacheService.remove('key');
      expect(await cacheService.get('key')).toEqual(undefined);
    });

    it('set/get/remove - object', async () => {
      await cacheService.set('key', { value: 42 });
      expect(await cacheService.get('key')).toEqual({ value: 42 });

      await cacheService.remove('key');
      expect(await cacheService.get('key')).toEqual(undefined);
    });

    it('get/remove - key not exists', async () => {
      // Nothing here...
      expect(await cacheService.get('non-existant-key')).toEqual(undefined);

      // Still nothing here...
      await cacheService.remove('non-existant-key');
      expect(await cacheService.get('non-existant-key')).toEqual(undefined);
    });

    it('read/clear cache', async () => {
      expect(await cacheService.readCache()).toEqual({});

      await cacheService.set('key', 42);
      expect(await cacheService.readCache()).toEqual({ key: 42 });

      await cacheService.set('foo', 'bar');
      expect(await cacheService.readCache()).toEqual({ key: 42, foo: 'bar' });

      await cacheService.clear();
      expect(await cacheService.readCache()).toEqual({});
    });

    it('write cache', async () => {
      expect(await cacheService.readCache()).toEqual({});

      await cacheService.writeCache({ key: 42, foo: 'bar' });

      expect(await cacheService.readCache()).toEqual({ key: 42, foo: 'bar' });
    });
  });

  describe('sync', () => {
    it('set/get/remove - primitive', () => {
      cacheService.setSync('key', 42);
      expect(cacheService.getSync('key')).toEqual(42);

      cacheService.removeSync('key');
      expect(cacheService.getSync('key')).toEqual(undefined);
    });

    it('set/get/remove - object', () => {
      cacheService.setSync('key', { value: 42 });
      expect(cacheService.getSync('key')).toEqual({ value: 42 });

      cacheService.removeSync('key');
      expect(cacheService.getSync('key')).toEqual(undefined);
    });

    it('get/remove - key not exists', () => {
      // Nothing here...
      expect(cacheService.getSync('non-existant-key')).toEqual(undefined);

      // Still nothing here...
      cacheService.removeSync('non-existant-key');
      expect(cacheService.getSync('non-existant-key')).toEqual(undefined);
    });

    it('read/clear cache', () => {
      expect(cacheService.readCacheSync()).toEqual({});

      cacheService.setSync('key', 42);
      expect(cacheService.readCacheSync()).toEqual({ key: 42 });

      cacheService.setSync('foo', 'bar');
      expect(cacheService.readCacheSync()).toEqual({ key: 42, foo: 'bar' });

      cacheService.clearSync();
      expect(cacheService.readCacheSync()).toEqual({});
    });

    it('write cache', () => {
      expect(cacheService.readCacheSync()).toEqual({});

      cacheService.writeCacheSync({ key: 42, foo: 'bar' });

      expect(cacheService.readCacheSync()).toEqual({ key: 42, foo: 'bar' });
    });
  });
});
