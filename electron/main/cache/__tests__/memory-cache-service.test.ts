import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryCacheServiceImpl } from '../memory-cache.service.js';

describe('memory-cache-service', () => {
  let cacheService: MemoryCacheServiceImpl;

  beforeEach(() => {
    cacheService = new MemoryCacheServiceImpl();
  });

  it('set/get/remove - primitive', () => {
    cacheService.set('key', 42);
    expect(cacheService.get('key')).toEqual(42);

    cacheService.remove('key');
    expect(cacheService.get('key')).toEqual(undefined);
  });

  it('set/get/remove - object', () => {
    cacheService.set('key', { value: 42 });
    expect(cacheService.get('key')).toEqual({ value: 42 });

    cacheService.remove('key');
    expect(cacheService.get('key')).toEqual(undefined);
  });

  it('get/remove - key not exists', () => {
    // Nothing here...
    expect(cacheService.get('non-existant-key')).toEqual(undefined);

    // Still nothing here...
    cacheService.remove('non-existant-key');
    expect(cacheService.get('non-existant-key')).toEqual(undefined);
  });

  it('read/clear cache', () => {
    expect(cacheService.readCache()).toEqual({});

    cacheService.set('key', 42);
    expect(cacheService.readCache()).toEqual({ key: 42 });

    cacheService.set('foo', 'bar');
    expect(cacheService.readCache()).toEqual({ key: 42, foo: 'bar' });

    cacheService.clear();
    expect(cacheService.readCache()).toEqual({});
  });

  it('write cache', () => {
    expect(cacheService.readCache()).toEqual({});

    cacheService.writeCache({ key: 42, foo: 'bar' });

    expect(cacheService.readCache()).toEqual({ key: 42, foo: 'bar' });
  });
});
