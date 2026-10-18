import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IgnoreSettingServiceImpl } from '../ignore.service.js';
import { buildIgnoreSetting } from '../ignore.utils.js';
import type { IgnoreSettingService } from '../types.js';

vi.mock('../../../logger/logger.factory.ts');

describe('ignore-service', () => {
  let ignoreService: IgnoreSettingService;

  beforeEach(() => {
    ignoreService = new IgnoreSettingServiceImpl();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#constructor', () => {
    it('should initialize with empty settings', async () => {
      ignoreService = new IgnoreSettingServiceImpl();

      expect(ignoreService.get()).toEqual([]);
    });

    it('should initialize with specified settings', async () => {
      const settings = [
        buildIgnoreSetting({
          pattern: 'pattern 0',
          className: 'class 0',
        }),
      ];

      ignoreService = new IgnoreSettingServiceImpl(settings);

      expect(ignoreService.get()).toEqual(settings);
    });
  });

  describe('#add', () => {
    it('should add settings', async () => {
      expect(ignoreService.get()).toEqual([]);

      const settings = [
        buildIgnoreSetting({
          pattern: 'pattern 0',
          className: 'class 0',
        }),
      ];

      ignoreService.add(settings);

      expect(ignoreService.get()).toEqual(settings);
    });
  });

  describe('#get', () => {
    it('should return empty settings', () => {
      const settings = ignoreService.get();

      expect(settings.length).toBe(0);
    });

    it('should return loaded settings', async () => {
      await ignoreService.load({
        filePath: path.join(__dirname, 'file.cfg'),
      });

      const settings = ignoreService.get();

      expect(settings.length).not.toBe(0);
    });
  });

  describe('#load', () => {
    it('should parse settings from file', async () => {
      await ignoreService.load({
        filePath: path.join(__dirname, 'file.cfg'),
      });

      const settings = ignoreService.get();

      expect(settings.length).toBe(2);

      const setting0 = buildIgnoreSetting({
        pattern: 'pattern 0',
        className: 'class 0',
      });
      expect(settings[0]).toEqual(setting0);

      const setting1 = buildIgnoreSetting({
        pattern: 'pattern 1',
        className: 'class 1',
      });
      expect(settings[1]).toEqual(setting1);
    });

    it('should skip incomplete settings', async () => {
      await ignoreService.load({
        filePath: path.join(__dirname, 'file2.cfg'),
      });

      const settings = ignoreService.get();

      expect(settings.length).toBe(2);

      const setting0 = buildIgnoreSetting({
        pattern: 'pattern 0',
        className: '',
      });
      expect(settings[0]).toEqual(setting0);

      const setting1 = buildIgnoreSetting({
        pattern: 'pattern 1',
        className: '',
      });
      expect(settings[1]).toEqual(setting1);
    });

    it('should append to previously loaded settings', async () => {
      await ignoreService.load({
        filePath: path.join(__dirname, 'file.cfg'),
      });

      expect(ignoreService.get().length).toBe(2);

      await ignoreService.load({
        filePath: path.join(__dirname, 'file.cfg'),
        mode: 'append',
      });

      expect(ignoreService.get().length).toBe(4);
    });

    it('should replace previously loaded settings', async () => {
      await ignoreService.load({
        filePath: path.join(__dirname, 'file.cfg'),
      });

      expect(ignoreService.get().length).toBe(2);

      await ignoreService.load({
        filePath: path.join(__dirname, 'file.cfg'),
        mode: 'replace',
      });

      expect(ignoreService.get().length).toBe(2);
    });
  });

  describe('#clear', () => {
    it('should clear settings', async () => {
      await ignoreService.load({
        filePath: path.join(__dirname, 'file.cfg'),
      });

      ignoreService.clear();

      const settings = ignoreService.get();

      expect(settings.length).toBe(0);
    });
  });
});
