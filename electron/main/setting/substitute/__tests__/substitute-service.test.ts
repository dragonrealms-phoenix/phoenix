import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SubstituteSettingServiceImpl } from '../substitute.service.js';
import { buildSubstituteSetting } from '../substitute.utils.js';
import type { SubstituteSettingService } from '../types.js';

vi.mock('../../../logger/logger.factory.ts');

describe('substitute-service', () => {
  let substituteService: SubstituteSettingService;

  beforeEach(() => {
    substituteService = new SubstituteSettingServiceImpl();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#constructor', () => {
    it('should initialize with empty settings', async () => {
      substituteService = new SubstituteSettingServiceImpl();

      expect(substituteService.get()).toEqual([]);
    });

    it('should initialize with specified settings', async () => {
      const settings = [
        buildSubstituteSetting({
          pattern: 'pattern 0',
          replacement: 'replacement 0',
          className: 'class 0',
        }),
      ];

      substituteService = new SubstituteSettingServiceImpl(settings);

      expect(substituteService.get()).toEqual(settings);
    });
  });

  describe('#add', () => {
    it('should add settings', async () => {
      expect(substituteService.get()).toEqual([]);

      const settings = [
        buildSubstituteSetting({
          pattern: 'pattern 0',
          replacement: 'replacement 0',
          className: 'class 0',
        }),
      ];

      substituteService.add(settings);

      expect(substituteService.get()).toEqual(settings);
    });
  });

  describe('#get', () => {
    it('should return empty settings', () => {
      const settings = substituteService.get();

      expect(settings.length).toBe(0);
    });

    it('should return loaded settings', async () => {
      await substituteService.load({
        filePath: path.join(__dirname, 'file.cfg'),
      });

      const settings = substituteService.get();

      expect(settings.length).not.toBe(0);
    });
  });

  describe('#load', () => {
    it('should parse settings from file', async () => {
      await substituteService.load({
        filePath: path.join(__dirname, 'file.cfg'),
      });

      const settings = substituteService.get();

      expect(settings.length).toBe(2);

      const setting0 = buildSubstituteSetting({
        pattern: 'pattern 0',
        replacement: 'replacement 0',
        className: 'class 0',
      });
      expect(settings[0]).toEqual(setting0);

      const setting1 = buildSubstituteSetting({
        pattern: 'pattern 1',
        replacement: 'replacement 1',
        className: 'class 1',
      });
      expect(settings[1]).toEqual(setting1);
    });

    it('should skip incomplete settings', async () => {
      await substituteService.load({
        filePath: path.join(__dirname, 'file2.cfg'),
      });

      const settings = substituteService.get();

      expect(settings.length).toBe(1);

      const setting0 = buildSubstituteSetting({
        pattern: 'pattern 0',
        replacement: 'replacement 0',
        className: '',
      });
      expect(settings[0]).toEqual(setting0);
    });

    it('should append to previously loaded settings', async () => {
      await substituteService.load({
        filePath: path.join(__dirname, 'file.cfg'),
      });

      expect(substituteService.get().length).toBe(2);

      await substituteService.load({
        filePath: path.join(__dirname, 'file.cfg'),
        mode: 'append',
      });

      expect(substituteService.get().length).toBe(4);
    });

    it('should replace previously loaded settings', async () => {
      await substituteService.load({
        filePath: path.join(__dirname, 'file.cfg'),
      });

      expect(substituteService.get().length).toBe(2);

      await substituteService.load({
        filePath: path.join(__dirname, 'file.cfg'),
        mode: 'replace',
      });

      expect(substituteService.get().length).toBe(2);
    });
  });

  describe('#clear', () => {
    it('should clear settings', async () => {
      await substituteService.load({
        filePath: path.join(__dirname, 'file.cfg'),
      });

      substituteService.clear();

      const settings = substituteService.get();

      expect(settings.length).toBe(0);
    });
  });
});
