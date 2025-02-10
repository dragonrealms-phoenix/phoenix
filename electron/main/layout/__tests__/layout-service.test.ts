import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Layout } from '../../../common/layout/types.js';
import { LayoutServiceImpl } from '../layout.service.js';
import type { LayoutService } from '../types.js';

type FsExtraModule = typeof import('fs-extra');
type ElectronModule = typeof import('electron');

const { mockFsExtra } = await vi.hoisted(async () => {
  const mockFsExtra = {
    pathExists: vi.fn<FsExtraModule['pathExists']>(),
    remove: vi.fn<FsExtraModule['remove']>(),
    writeJson: vi.fn<FsExtraModule['writeJson']>(),
    readJson: vi.fn<FsExtraModule['readJson']>(),
    readdir: vi.fn<FsExtraModule['readdir']>(),
    ensureFile: vi.fn<FsExtraModule['ensureFile']>(),
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

vi.mock('electron', async (importOriginal) => {
  const actualModule = await importOriginal<ElectronModule>();
  return {
    ...actualModule,
    app: {
      ...actualModule.app,
      getPath: vi.fn(() => 'test-path'),
    },
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
    streams: [],
  };

  let layoutService: LayoutService;

  beforeEach(() => {
    layoutService = new LayoutServiceImpl();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe('#getLayout', () => {
    it('returns undefined when file does not exist', async () => {
      const layout = await layoutService.getLayout({
        layoutName: 'test-layout-name',
      });

      expect(mockFsExtra.pathExists).toBeCalledWith(
        'test-path/layouts/test-layout-name.json'
      );

      expect(layout).toBeUndefined();
    });

    it('returns layout json when file exists', async () => {
      mockFsExtra.pathExists = vi.fn().mockResolvedValue(true);
      mockFsExtra.readJson = vi.fn().mockResolvedValue(mockLayout);

      const layout = await layoutService.getLayout({
        layoutName: 'test-layout-name',
      });

      expect(mockFsExtra.pathExists).toBeCalledWith(
        'test-path/layouts/test-layout-name.json'
      );

      expect(layout).toEqual(mockLayout);
    });
  });

  describe('#listLayoutNames', () => {
    it('returns empty array when files not exist', async () => {
      mockFsExtra.readdir = vi.fn().mockResolvedValue([]);

      const layouts = await layoutService.listLayoutNames();

      expect(mockFsExtra.readdir).toBeCalledWith('test-path/layouts');

      expect(layouts).toEqual([]);
    });

    it('returns layout names when files exist', async () => {
      mockFsExtra.readdir = vi
        .fn()
        .mockResolvedValue([
          'test-layout-1.json',
          'test-layout-2.json',
          'not-a-json-file.txt',
        ]);

      const layouts = await layoutService.listLayoutNames();

      expect(mockFsExtra.readdir).toBeCalledWith('test-path/layouts');

      expect(layouts).toEqual(
        expect.arrayContaining(['test-layout-1', 'test-layout-2'])
      );
    });
  });

  describe('#saveLayout', () => {
    it('writes layout json to file', async () => {
      await layoutService.saveLayout({
        layoutName: 'test-layout-name',
        layout: mockLayout,
      });

      expect(mockFsExtra.ensureFile).toBeCalledWith(
        'test-path/layouts/test-layout-name.json'
      );

      expect(mockFsExtra.writeJson).toBeCalledWith(
        'test-path/layouts/test-layout-name.json',
        mockLayout,
        { spaces: 2 }
      );
    });
  });

  describe('#deleteLayout', () => {
    it('does nothing if layout file does not exist', async () => {
      mockFsExtra.pathExists = vi.fn().mockResolvedValue(false);

      await layoutService.deleteLayout({
        layoutName: 'test-layout-name',
      });

      expect(mockFsExtra.pathExists).toBeCalledWith(
        'test-path/layouts/test-layout-name.json'
      );

      expect(mockFsExtra.remove).not.toBeCalled();
    });

    it('deletes layout file if exists', async () => {
      mockFsExtra.pathExists = vi.fn().mockResolvedValue(true);

      await layoutService.deleteLayout({
        layoutName: 'test-layout-name',
      });

      expect(mockFsExtra.pathExists).toBeCalledWith(
        'test-path/layouts/test-layout-name.json'
      );

      expect(mockFsExtra.remove).toBeCalledWith(
        'test-path/layouts/test-layout-name.json'
      );
    });
  });
});
