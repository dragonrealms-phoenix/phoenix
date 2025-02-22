import fs from 'fs-extra';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CacheServiceMockImpl } from '../__mocks__/cache-service.mock.js';
import { DiskCacheServiceImpl } from '../disk-cache.service.js';
import { logger } from '../logger.js';

vi.mock('../../logger/logger.factory.ts');

describe('disk-cache-service', () => {
  const filePath = '/tmp/dsa2d';

  beforeEach(() => {
    fs.writeJsonSync(filePath, {});
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    fs.removeSync(filePath);
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#constructor', () => {
    it('creates cache file if not exists', async () => {
      fs.removeSync(filePath);

      expect(fs.pathExistsSync(filePath)).toBe(false);

      const cacheService = new DiskCacheServiceImpl({
        filePath,
      });

      expect(cacheService.readCache()).toEqual({});

      await vi.advanceTimersToNextTimerAsync();

      expect(fs.pathExistsSync(filePath)).toBe(true);
    });

    it('loads cache file if exists', async () => {
      await fs.writeJson(filePath, { key: 42 });

      expect(fs.pathExistsSync(filePath)).toBe(true);

      const cacheService = new DiskCacheServiceImpl({
        filePath,
      });

      expect(cacheService.readCache()).toEqual({ key: 42 });

      expect(fs.pathExistsSync(filePath)).toBe(true);
    });

    it('logs error when error loading existing cache file', async () => {
      const readJsonSpy = vi
        .spyOn(fs, 'readJsonSync')
        .mockImplementation(() => {
          throw new Error('test');
        });

      const cacheService = new DiskCacheServiceImpl({
        filePath,
      });

      expect(readJsonSpy).toHaveBeenCalledWith(filePath);
      expect(logger.error).toHaveBeenCalledWith(
        'error initializing disk cache',
        {
          filePath,
          error: new Error('test'),
        }
      );
      expect(cacheService.readCache()).toEqual({});

      readJsonSpy.mockRestore();
    });
  });

  describe('#set', () => {
    it('sets a primitive cache value', async () => {
      const cacheBefore = await fs.readJson(filePath);

      const cacheService = new DiskCacheServiceImpl({
        filePath,
      });

      cacheService.set('key', 42);

      await vi.advanceTimersToNextTimerAsync();

      const cacheAfter = await fs.readJson(filePath);

      expect(cacheBefore.key).toEqual(undefined);
      expect(cacheAfter.key).toEqual(42);
    });

    it('sets an object cache value', async () => {
      const cacheBefore = await fs.readJson(filePath);

      const cacheService = new DiskCacheServiceImpl({
        filePath,
      });

      cacheService.set('key', { value: 42 });

      await vi.advanceTimersToNextTimerAsync();

      const cacheAfter = await fs.readJson(filePath);

      expect(cacheBefore.key).toEqual(undefined);
      expect(cacheAfter.key).toEqual({ value: 42 });
    });
  });

  describe('#get', () => {
    it('gets a primitive cache value', async () => {
      await fs.writeJson(filePath, { key: 42 });

      const cacheService = new DiskCacheServiceImpl({
        filePath,
      });

      const value = cacheService.get('key');

      expect(value).toEqual(42);
    });

    it('gets an object cache value', async () => {
      await fs.writeJson(filePath, { key: { value: 42 } });

      const cacheService = new DiskCacheServiceImpl({
        filePath,
      });

      const value = cacheService.get('key');

      expect(value).toEqual({ value: 42 });
    });

    it('gets undefined when key is not found', async () => {
      const cacheService = new DiskCacheServiceImpl({
        filePath,
      });

      const value = cacheService.get('key');

      expect(value).toEqual(undefined);
    });
  });

  describe('#remove', () => {
    it('removes a primitive cache value', async () => {
      await fs.writeJson(filePath, { key: 42 });

      const cacheBefore = await fs.readJson(filePath);

      const cacheService = new DiskCacheServiceImpl({
        filePath,
      });

      cacheService.remove('key');

      await vi.advanceTimersToNextTimerAsync();

      const cacheAfter = await fs.readJson(filePath);

      expect(cacheBefore.key).toEqual(42);
      expect(cacheAfter.key).toEqual(undefined);
    });

    it('removes an object cache value', async () => {
      await fs.writeJson(filePath, { key: { value: 42 } });

      const cacheBefore = await fs.readJson(filePath);

      const cacheService = new DiskCacheServiceImpl({
        filePath,
      });

      cacheService.remove('key');

      await vi.advanceTimersToNextTimerAsync();

      const cacheAfter = await fs.readJson(filePath);

      expect(cacheBefore.key).toEqual({ value: 42 });
      expect(cacheAfter.key).toEqual(undefined);
    });

    it('makes no change when key is not found', async () => {
      await fs.writeJson(filePath, { key: 42 });

      const cacheBefore = await fs.readJson(filePath);

      const cacheService = new DiskCacheServiceImpl({
        filePath,
      });

      cacheService.remove('non-existant-key');

      await vi.advanceTimersToNextTimerAsync();

      const cacheAfter = await fs.readJson(filePath);

      expect(cacheBefore).toEqual(cacheAfter);
    });
  });

  describe('#clear', () => {
    it('removes all entries from the cache', async () => {
      await fs.writeJson(filePath, { key: { value: 42 } });

      const cacheBefore = await fs.readJson(filePath);

      const cacheService = new DiskCacheServiceImpl({
        filePath,
      });

      cacheService.clear();

      await vi.advanceTimersToNextTimerAsync();

      const cacheAfter = await fs.readJson(filePath);

      expect(cacheBefore).toEqual({ key: { value: 42 } });
      expect(cacheAfter).toEqual({});
    });
  });

  describe('#readCache', () => {
    it('gets all key-values in the cache', async () => {
      const cacheService = new DiskCacheServiceImpl({
        filePath,
      });

      expect(cacheService.readCache()).toEqual({});

      cacheService.set('key', 42);
      expect(cacheService.readCache()).toEqual({ key: 42 });

      cacheService.set('foo', 'bar');
      expect(cacheService.readCache()).toEqual({ key: 42, foo: 'bar' });

      cacheService.clear();
      expect(cacheService.readCache()).toEqual({});
    });
  });

  describe('#writeCache', () => {
    it('replaces all key-values in the cache', async () => {
      const cacheService = new DiskCacheServiceImpl({
        filePath,
      });

      expect(cacheService.readCache()).toEqual({});

      cacheService.writeCache({ key: 42, foo: 'bar' });

      expect(cacheService.readCache()).toEqual({ key: 42, foo: 'bar' });
    });
  });

  describe('#writeToDisk', async () => {
    it('logs error when error writing cache to disk', async () => {
      // The disk cache service reads data from its delegate
      // to get the data to write to disk.
      // To test a failure, we'll throw an error from the delegate.
      const mockCacheService = new CacheServiceMockImpl();
      mockCacheService.readCache.mockImplementation(() => {
        throw new Error('test');
      });

      const cacheService = new DiskCacheServiceImpl({
        filePath,
        delegate: mockCacheService,
      });

      cacheService.set('key', 42);

      await vi.runAllTimersAsync();

      expect(logger.error).toHaveBeenCalledWith('error writing cache to disk', {
        filePath,
        error: new Error('test'),
      });
    });

    it('debounces writes to disk', async () => {
      const writeJsonSpy = vi.spyOn(fs, 'writeJson');

      const cacheService = new DiskCacheServiceImpl({
        filePath,
      });

      cacheService.set('k1', 1);
      cacheService.set('k2', 2);

      expect(writeJsonSpy).toHaveBeenCalledTimes(0);
      expect(fs.readJsonSync(filePath)).toEqual({});

      // Let the write queue process.
      await vi.advanceTimersToNextTimerAsync();

      // Wait for writes to debounce.
      await vi.advanceTimersToNextTimerAsync();

      expect(writeJsonSpy).toHaveBeenCalledTimes(1);
      expect(fs.readJsonSync(filePath)).toEqual({ k1: 1, k2: 2 });
    });
  });
});
