import * as fs from 'fs-extra';
import cloneDeep from 'lodash-es/cloneDeep.js';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { mockCreateLogger } from '../../../common/__mocks__/create-logger.mock.js';
import type { Logger } from '../../../common/logger/types.js';
import { DiskCacheServiceImpl } from '../disk-cache.service.js';
import type { CacheService } from '../types.js';

type FsExtraModule = typeof import('fs-extra');

// To mock the file system, we'll use the memory cache service.
// Filepaths are the keys and what data is written are the values.
// When was using a real filesystem, encountered concurrency issues
// that led to flaky tests.
const { mockFsCacheService } = await vi.hoisted(async () => {
  const memoryCacheModule = await import('../memory-cache.service.js');
  const { MemoryCacheServiceImpl } = memoryCacheModule;

  return {
    mockFsCacheService: new MemoryCacheServiceImpl(),
  };
});

vi.mock('fs-extra', async () => {
  // Implementing just enough methods to test the disk cache service.
  const mockFsExtra: Pick<
    FsExtraModule,
    | 'pathExists'
    | 'pathExistsSync'
    | 'remove'
    | 'removeSync'
    | 'writeJson'
    | 'writeJsonSync'
    | 'readJson'
    | 'readJsonSync'
  > = {
    pathExists: async (path: string) => {
      return mockFsCacheService.getSync(path) !== undefined;
    },

    pathExistsSync: (path: string) => {
      return mockFsCacheService.getSync(path) !== undefined;
    },

    remove: async (path: string) => {
      mockFsCacheService.removeSync(path);
    },

    removeSync: (path: string) => {
      mockFsCacheService.removeSync(path);
    },

    writeJson: async (path: string, data: Cache) => {
      mockFsCacheService.setSync(path, cloneDeep(data));
    },

    writeJsonSync: (path: string, data: Cache) => {
      mockFsCacheService.setSync(path, cloneDeep(data));
    },

    readJson: async (path: string) => {
      return cloneDeep(mockFsCacheService.getSync(path));
    },

    readJsonSync: (path: string) => {
      return cloneDeep(mockFsCacheService.getSync(path));
    },
  };

  return mockFsExtra;
});

describe('disk-cache-service', () => {
  const filepath = '/tmp/dsa2d';

  let logger: Logger;

  beforeAll(async () => {
    logger = await mockCreateLogger('test');
  });

  beforeEach(() => {
    fs.writeJsonSync(filepath, {});
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    fs.removeSync(filepath);
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#constructor', () => {
    it('creates cache file if not exists', async () => {
      fs.removeSync(filepath);

      expect(fs.pathExistsSync(filepath)).toBeFalsy();

      const cacheService = new DiskCacheServiceImpl({
        filepath,
      });

      expect(await cacheService.readCache()).toEqual({});

      expect(fs.pathExistsSync(filepath)).toBeTruthy();
    });

    it('loads cache file if exists', async () => {
      await fs.writeJson(filepath, { key: 42 });

      expect(fs.pathExistsSync(filepath)).toBeTruthy();

      const cacheService = new DiskCacheServiceImpl({
        filepath,
      });

      expect(await cacheService.readCache()).toEqual({ key: 42 });

      expect(fs.pathExistsSync(filepath)).toBeTruthy();
    });

    it('logs error when error loading existing cache file', async () => {
      const readJsonSpy = vi
        .spyOn(fs, 'readJsonSync')
        .mockImplementation(() => {
          throw new Error('test');
        });

      const logErrorSpy = vi.spyOn(logger, 'error');

      const cacheService = new DiskCacheServiceImpl({
        filepath,
      });

      expect(readJsonSpy).toHaveBeenCalledWith(filepath);
      expect(logErrorSpy).toHaveBeenCalledWith(
        'error initializing disk cache',
        {
          filepath,
          error: new Error('test'),
        }
      );
      expect(await cacheService.readCache()).toEqual({});

      readJsonSpy.mockRestore();
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

  describe('#writeToDisk', async () => {
    it('logs error when error writing cache to disk', async () => {
      // The disk cache service reads data from its delegate
      // to get the data to write to disk.
      // To test a failure, we'll throw an error from the delegate.
      const mockCacheService: CacheService = {
        set: vi.fn(),
        get: vi.fn(),
        remove: vi.fn(),
        clear: vi.fn(),
        readCache: vi.fn().mockRejectedValue(new Error('test')),
        writeCache: vi.fn(),
      };

      const logErrorSpy = vi.spyOn(logger, 'error');

      const cacheService = new DiskCacheServiceImpl({
        filepath,
        createInMemoryCache: () => mockCacheService,
      });

      await cacheService.set('key', 42);

      await vi.runAllTimersAsync();

      expect(logErrorSpy).toHaveBeenCalledWith('error writing cache to disk', {
        filepath,
        error: new Error('test'),
      });
    });
  });
});
