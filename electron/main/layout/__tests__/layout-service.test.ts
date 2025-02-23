import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Layout } from '../../../common/layout/types.js';
import { LayoutServiceImpl } from '../layout.service.js';
import type { LayoutService } from '../types.js';

type FsExtraModule = typeof import('fs-extra');

const { mockFsExtra } = await vi.hoisted(async () => {
  const mockFsExtra = {
    pathExistsSync: vi.fn<FsExtraModule['pathExistsSync']>(),
    removeSync: vi.fn<FsExtraModule['removeSync']>(),
    writeJsonSync: vi.fn<FsExtraModule['writeJsonSync']>(),
    readJsonSync: vi.fn<FsExtraModule['readJsonSync']>(),
    readdirSync: vi.fn<FsExtraModule['readdirSync']>(),
    ensureFileSync: vi.fn<FsExtraModule['ensureFileSync']>(),
  };

  return {
    mockFsExtra,
  };
});

vi.mock('fs-extra', async () => {
  return {
    default: mockFsExtra,
  };
});

vi.mock('../../logger/logger.factory.ts');

describe('layout-service', () => {
  const mockLayout: Layout = {
    window: {
      height: 100,
      width: 100,
      x: 100,
      y: 100,
    },
    items: [],
  };

  let layoutService: LayoutService;

  beforeEach(() => {
    layoutService = new LayoutServiceImpl({
      baseDir: 'test-base-dir',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe('#getLayout', () => {
    it('returns undefined when file does not exist', async () => {
      const layout = layoutService.getLayout({
        layoutName: 'test-layout-name',
      });

      expect(mockFsExtra.pathExistsSync).toBeCalledWith(
        'test-base-dir/test-layout-name.json'
      );

      expect(layout).toBeUndefined();
    });

    it('returns layout json when file exists', async () => {
      mockFsExtra.pathExistsSync = vi.fn().mockReturnValue(true);
      mockFsExtra.readJsonSync = vi.fn().mockReturnValue(mockLayout);

      const layout = layoutService.getLayout({
        layoutName: 'test-layout-name',
      });

      expect(mockFsExtra.pathExistsSync).toBeCalledWith(
        'test-base-dir/test-layout-name.json'
      );

      expect(layout).toEqual(mockLayout);
    });
  });

  describe('#listLayoutNames', () => {
    it('returns empty array when files not exist', async () => {
      mockFsExtra.readdirSync = vi.fn().mockReturnValue([]);

      const layouts = layoutService.listLayoutNames();

      expect(mockFsExtra.readdirSync).toBeCalledWith('test-base-dir');

      expect(layouts).toEqual([]);
    });

    it('returns layout names when files exist', async () => {
      mockFsExtra.readdirSync = vi
        .fn()
        .mockReturnValue([
          'test-layout-1.json',
          'test-layout-2.json',
          'not-a-json-file.txt',
        ]);

      const layouts = layoutService.listLayoutNames();

      expect(mockFsExtra.readdirSync).toBeCalledWith('test-base-dir');

      expect(layouts).toEqual(
        expect.arrayContaining(['test-layout-1', 'test-layout-2'])
      );
    });
  });

  describe('#saveLayout', () => {
    it('writes layout json to file', async () => {
      layoutService.saveLayout({
        layoutName: 'test-layout-name',
        layout: mockLayout,
      });

      expect(mockFsExtra.ensureFileSync).toBeCalledWith(
        'test-base-dir/test-layout-name.json'
      );

      expect(mockFsExtra.writeJsonSync).toBeCalledWith(
        'test-base-dir/test-layout-name.json',
        mockLayout,
        { spaces: 2 }
      );
    });
  });

  describe('#deleteLayout', () => {
    it('does nothing if layout file does not exist', async () => {
      mockFsExtra.pathExistsSync = vi.fn().mockReturnValue(false);

      layoutService.deleteLayout({
        layoutName: 'test-layout-name',
      });

      expect(mockFsExtra.pathExistsSync).toBeCalledWith(
        'test-base-dir/test-layout-name.json'
      );

      expect(mockFsExtra.removeSync).not.toBeCalled();
    });

    it('deletes layout file if exists', async () => {
      mockFsExtra.pathExistsSync = vi.fn().mockReturnValue(true);

      layoutService.deleteLayout({
        layoutName: 'test-layout-name',
      });

      expect(mockFsExtra.pathExistsSync).toBeCalledWith(
        'test-base-dir/test-layout-name.json'
      );

      expect(mockFsExtra.removeSync).toBeCalledWith(
        'test-base-dir/test-layout-name.json'
      );
    });
  });
});
