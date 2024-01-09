import { MemoryCacheServiceImpl } from '../memory-cache.service';

describe('memory-cache-service', () => {
  let cacheService: MemoryCacheServiceImpl;

  beforeEach(() => {
    cacheService = new MemoryCacheServiceImpl();
  });

  test('set/get/remove - primitive', async () => {
    await cacheService.set('key', 42);
    expect(await cacheService.get('key')).toEqual(42);

    await cacheService.remove('key');
    expect(await cacheService.get('key')).toEqual(undefined);
  });

  test('set/get/remove - object', async () => {
    await cacheService.set('key', { value: 42 });
    expect(await cacheService.get('key')).toEqual({ value: 42 });

    await cacheService.remove('key');
    expect(await cacheService.get('key')).toEqual(undefined);
  });

  test('get/remove - key not exists', async () => {
    // Nothing here...
    expect(await cacheService.get('non-existant-key')).toEqual(undefined);

    // Still nothing here...
    await cacheService.remove('non-existant-key');
    expect(await cacheService.get('non-existant-key')).toEqual(undefined);
  });

  test('read/clear cache', async () => {
    expect(await cacheService.readCache()).toEqual({});

    await cacheService.set('key', 42);
    expect(await cacheService.readCache()).toEqual({ key: 42 });

    await cacheService.set('foo', 'bar');
    expect(await cacheService.readCache()).toEqual({ key: 42, foo: 'bar' });

    await cacheService.clear();
    expect(await cacheService.readCache()).toEqual({});
  });

  test('write cache', async () => {
    expect(await cacheService.readCache()).toEqual({});

    await cacheService.writeCache({ key: 42, foo: 'bar' });

    expect(await cacheService.readCache()).toEqual({ key: 42, foo: 'bar' });
  });
});
