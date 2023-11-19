import * as fs from 'fs-extra';
import { DiskCacheServiceImpl } from '../disk-cache.service';

describe('DiskCacheService tests', () => {
  const filepath = '/tmp/dsa2d';

  beforeEach(() => {
    fs.writeJsonSync(filepath, {});
  });

  afterEach(() => {
    fs.removeSync(filepath);
  });

  test('set - primitive', async () => {
    const cacheBefore = await fs.readJson(filepath);

    const cacheService = new DiskCacheServiceImpl({
      filepath,
    });

    await cacheService.set('key', 42);

    const cacheAfter = await fs.readJson(filepath);

    expect(cacheBefore.key).toEqual(undefined);
    expect(cacheAfter.key).toEqual(42);
  });

  test('set - object', async () => {
    const cacheBefore = await fs.readJson(filepath);

    const cacheService = new DiskCacheServiceImpl({
      filepath,
    });

    await cacheService.set('key', { value: 42 });

    const cacheAfter = await fs.readJson(filepath);

    expect(cacheBefore.key).toEqual(undefined);
    expect(cacheAfter.key).toEqual({ value: 42 });
  });

  test('get - primitive', async () => {
    await fs.writeJson(filepath, { key: 42 });

    const cacheService = new DiskCacheServiceImpl({
      filepath,
    });

    const value = await cacheService.get('key');

    expect(value).toEqual(42);
  });

  test('get - object', async () => {
    await fs.writeJson(filepath, { key: { value: 42 } });

    const cacheService = new DiskCacheServiceImpl({
      filepath,
    });

    const value = await cacheService.get('key');

    expect(value).toEqual({ value: 42 });
  });

  test('get - key not exists', async () => {
    const cacheService = new DiskCacheServiceImpl({
      filepath,
    });

    const value = await cacheService.get('key');

    expect(value).toEqual(undefined);
  });

  test('remove - primitive', async () => {
    await fs.writeJson(filepath, { key: 42 });

    const cacheBefore = await fs.readJson(filepath);

    const cacheService = new DiskCacheServiceImpl({
      filepath,
    });

    await cacheService.remove('key');

    const cacheAfter = await fs.readJson(filepath);

    expect(cacheBefore.key).toEqual(42);
    expect(cacheAfter.key).toEqual(undefined);
  });

  test('remove - object', async () => {
    await fs.writeJson(filepath, { key: { value: 42 } });

    const cacheBefore = await fs.readJson(filepath);

    const cacheService = new DiskCacheServiceImpl({
      filepath,
    });

    await cacheService.remove('key');

    const cacheAfter = await fs.readJson(filepath);

    expect(cacheBefore.key).toEqual({ value: 42 });
    expect(cacheAfter.key).toEqual(undefined);
  });

  test('remove - key not exists', async () => {
    const cacheBefore = await fs.readJson(filepath);

    const cacheService = new DiskCacheServiceImpl({
      filepath,
    });

    await cacheService.remove('non-existant-key');

    const cacheAfter = await fs.readJson(filepath);

    expect(cacheBefore.key).toEqual(undefined);
    expect(cacheAfter.key).toEqual(undefined);
  });

  test('clear', async () => {
    await fs.writeJson(filepath, { key: { value: 42 } });

    const cacheBefore = await fs.readJson(filepath);

    const cacheService = new DiskCacheServiceImpl({
      filepath,
    });

    await cacheService.clear();

    const cacheAfter = await fs.readJson(filepath);

    expect(cacheBefore).toEqual({ key: { value: 42 } });
    expect(cacheAfter).toEqual({});
  });

  test('read cache', async () => {
    const cacheService = new DiskCacheServiceImpl({
      filepath,
    });

    expect(await cacheService.readCache()).toEqual({});

    await cacheService.set('key', 42);
    expect(await cacheService.readCache()).toEqual({ key: 42 });

    await cacheService.set('foo', 'bar');
    expect(await cacheService.readCache()).toEqual({ key: 42, foo: 'bar' });

    await cacheService.clear();
    expect(await cacheService.readCache()).toEqual({});
  });

  test('write cache', async () => {
    const cacheService = new DiskCacheServiceImpl({
      filepath,
    });

    expect(await cacheService.readCache()).toEqual({});

    await cacheService.writeCache({ key: 42, foo: 'bar' });

    expect(await cacheService.readCache()).toEqual({ key: 42, foo: 'bar' });
  });
});
