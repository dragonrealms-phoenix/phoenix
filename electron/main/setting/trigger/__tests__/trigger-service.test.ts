import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TriggerSettingServiceImpl } from '../trigger.service.js';
import { buildTriggerSetting } from '../trigger.utils.js';
import type { TriggerSettingService } from '../types.js';

vi.mock('../../../logger/logger.factory.ts');

describe('trigger-service', () => {
  let triggerService: TriggerSettingService;

  beforeEach(() => {
    triggerService = new TriggerSettingServiceImpl();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#get', () => {
    it('should return empty settings', () => {
      const settings = triggerService.get();

      expect(settings.length).toBe(0);
    });

    it('should return loaded settings', async () => {
      await triggerService.load({
        filePath: path.join(__dirname, 'file.cfg'),
      });

      const settings = triggerService.get();

      expect(settings.length).not.toBe(0);
    });
  });

  describe('#load', () => {
    it('should parse settings from file', async () => {
      await triggerService.load({
        filePath: path.join(__dirname, 'file.cfg'),
      });

      const settings = triggerService.get();

      expect(settings.length).toBe(2);

      const setting0 = buildTriggerSetting({
        pattern: 'pattern 0',
        action: 'action 0',
        className: 'class 0',
      });
      expect(settings[0]).toEqual(setting0);

      const setting1 = buildTriggerSetting({
        pattern: 'pattern 1',
        action: 'action 1a; action 1b',
        className: 'class 1',
      });
      expect(settings[1]).toEqual(setting1);
    });

    it('should skip incomplete settings', async () => {
      await triggerService.load({
        filePath: path.join(__dirname, 'file2.cfg'),
      });

      const settings = triggerService.get();

      expect(settings.length).toBe(1);

      const setting0 = buildTriggerSetting({
        pattern: 'pattern 0',
        action: 'action 0',
        className: '',
      });
      expect(settings[0]).toEqual(setting0);
    });

    it('should append to previously loaded settings', async () => {
      await triggerService.load({
        filePath: path.join(__dirname, 'file.cfg'),
      });

      expect(triggerService.get().length).toBe(2);

      await triggerService.load({
        filePath: path.join(__dirname, 'file.cfg'),
        mode: 'append',
      });

      expect(triggerService.get().length).toBe(4);
    });

    it('should replace previously loaded settings', async () => {
      await triggerService.load({
        filePath: path.join(__dirname, 'file.cfg'),
      });

      expect(triggerService.get().length).toBe(2);

      await triggerService.load({
        filePath: path.join(__dirname, 'file.cfg'),
        mode: 'replace',
      });

      expect(triggerService.get().length).toBe(2);
    });
  });

  describe('#clear', () => {
    it('should clear settings', async () => {
      await triggerService.load({
        filePath: path.join(__dirname, 'file.cfg'),
      });

      triggerService.clear();

      const settings = triggerService.get();

      expect(settings.length).toBe(0);
    });
  });
});
