import * as fs from 'fs-extra';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DiskCacheServiceImpl } from '../disk-cache.service.js';

// To quickly skip past the debounced write to disk time.
vi.useFakeTimers();

describe('disk-cache-service', () => {
  const filepath = '/tmp/dsa2d';

  beforeEach(() => {
    fs.writeJsonSync(filepath, {});
  });

  afterEach(() => {
    fs.removeSync(filepath);
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe('#constructor', () => {
    it('creates cache file if not exists', async () => {
      fs.removeSync(filepath);

      const cacheService = new DiskCacheServiceImpl({
        filepath,
      });

      expect(await cacheService.readCache()).toEqual({});

      expect(fs.pathExistsSync(filepath)).toBeTruthy();
    });
  });

  describe('#set', () => {
    it('sets a primitive cache value', async () => {
      const cacheBefore = await fs.readJson(filepath);

      const cacheService = new DiskCacheServiceImpl({
        filepath,
      });

      await cacheService.set('key', 42);

      await vi.advanceTimersToNextTimerAsync();

      const cacheAfter = await fs.readJson(filepath);

      expect(cacheBefore.key).toEqual(undefined);
      expect(cacheAfter.key).toEqual(42);
    });

    it('sets an object cache value', async () => {
      const cacheBefore = await fs.readJson(filepath);

      const cacheService = new DiskCacheServiceImpl({
        filepath,
      });

      await cacheService.set('key', { value: 42 });

      await vi.advanceTimersToNextTimerAsync();

      const cacheAfter = await fs.readJson(filepath);

      expect(cacheBefore.key).toEqual(undefined);
      expect(cacheAfter.key).toEqual({ value: 42 });
    });
  });

  describe('#get', () => {
    it('gets a primitive cache value', async () => {
      await fs.writeJson(filepath, { key: 42 });

      const cacheService = new DiskCacheServiceImpl({
        filepath,
      });

      const value = await cacheService.get('key');

      expect(value).toEqual(42);
    });

    it('gets an object cache value', async () => {
      await fs.writeJson(filepath, { key: { value: 42 } });

      const cacheService = new DiskCacheServiceImpl({
        filepath,
      });

      const value = await cacheService.get('key');

      expect(value).toEqual({ value: 42 });
    });

    it('gets undefined when key is not found', async () => {
      const cacheService = new DiskCacheServiceImpl({
        filepath,
      });

      const value = await cacheService.get('key');

      expect(value).toEqual(undefined);
    });
  });

  describe('#remove', () => {
    it('removes a primitive cache value', async () => {
      await fs.writeJson(filepath, { key: 42 });

      const cacheBefore = await fs.readJson(filepath);

      const cacheService = new DiskCacheServiceImpl({
        filepath,
      });

      await cacheService.remove('key');

      await vi.advanceTimersToNextTimerAsync();

      const cacheAfter = await fs.readJson(filepath);

      expect(cacheBefore.key).toEqual(42);
      expect(cacheAfter.key).toEqual(undefined);
    });

    it('removes an object cache value', async () => {
      await fs.writeJson(filepath, { key: { value: 42 } });

      const cacheBefore = await fs.readJson(filepath);

      const cacheService = new DiskCacheServiceImpl({
        filepath,
      });

      await cacheService.remove('key');

      await vi.advanceTimersToNextTimerAsync();

      const cacheAfter = await fs.readJson(filepath);

      expect(cacheBefore.key).toEqual({ value: 42 });
      expect(cacheAfter.key).toEqual(undefined);
    });

    it('makes no change when key is not found', async () => {
      await fs.writeJson(filepath, { key: 42 });

      const cacheBefore = await fs.readJson(filepath);

      const cacheService = new DiskCacheServiceImpl({
        filepath,
      });

      await cacheService.remove('non-existant-key');

      await vi.advanceTimersToNextTimerAsync();

      const cacheAfter = await fs.readJson(filepath);

      expect(cacheBefore).toEqual(cacheAfter);
    });
  });

  describe('#clear', () => {
    it('removes all entries from the cache', async () => {
      await fs.writeJson(filepath, { key: { value: 42 } });

      const cacheBefore = await fs.readJson(filepath);

      const cacheService = new DiskCacheServiceImpl({
        filepath,
      });

      await cacheService.clear();

      await vi.advanceTimersToNextTimerAsync();

      const cacheAfter = await fs.readJson(filepath);

      expect(cacheBefore).toEqual({ key: { value: 42 } });
      expect(cacheAfter).toEqual({});
    });
  });

  describe('#readCache', () => {
    it('gets all key-values in the cache', async () => {
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
  });

  describe('#writeCache', () => {
    it('replaces all key-values in the cache', async () => {
      const cacheService = new DiskCacheServiceImpl({
        filepath,
      });

      expect(await cacheService.readCache()).toEqual({});

      await cacheService.writeCache({ key: 42, foo: 'bar' });

      expect(await cacheService.readCache()).toEqual({ key: 42, foo: 'bar' });
    });
  });
});
