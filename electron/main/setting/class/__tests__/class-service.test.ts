import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ClassSettingServiceImpl } from '../class.service.js';
import { buildClassSetting } from '../class.utils.js';
import type { ClassSettingService } from '../types.js';

vi.mock('../../../logger/logger.factory.ts');

describe('class-service', () => {
  let classService: ClassSettingService;

  beforeEach(() => {
    classService = new ClassSettingServiceImpl();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#get', () => {
    it('should return empty settings', () => {
      const settings = classService.get();

      expect(settings.length).toBe(0);
    });

    it('should return loaded settings', async () => {
      await classService.load({
        filePath: path.join(__dirname, 'file.cfg'),
      });

      const settings = classService.get();

      expect(settings.length).not.toBe(0);
    });
  });

  describe('#load', () => {
    it('should parse settings from file', async () => {
      await classService.load({
        filePath: path.join(__dirname, 'file.cfg'),
      });

      const settings = classService.get();

      expect(settings.length).toBe(2);

      const class0 = buildClassSetting({
        name: 'name 0',
        enabled: 'true',
      });
      expect(settings[0]).toEqual(class0);

      const class1 = buildClassSetting({
        name: 'name 1',
        enabled: 'false',
      });
      expect(settings[1]).toEqual(class1);
    });

    it('should append to previously loaded settings', async () => {
      await classService.load({
        filePath: path.join(__dirname, 'file.cfg'),
      });

      expect(classService.get().length).toBe(2);

      await classService.load({
        filePath: path.join(__dirname, 'file.cfg'),
        mode: 'append',
      });

      expect(classService.get().length).toBe(4);
    });

    it('should replace previously loaded settings', async () => {
      await classService.load({
        filePath: path.join(__dirname, 'file.cfg'),
      });

      expect(classService.get().length).toBe(2);

      await classService.load({
        filePath: path.join(__dirname, 'file.cfg'),
        mode: 'replace',
      });

      expect(classService.get().length).toBe(2);
    });
  });

  describe('#clear', () => {
    it('should clear settings', async () => {
      await classService.load({
        filePath: path.join(__dirname, 'file.cfg'),
      });

      classService.clear();

      const settings = classService.get();

      expect(settings.length).toBe(0);
    });
  });
});
