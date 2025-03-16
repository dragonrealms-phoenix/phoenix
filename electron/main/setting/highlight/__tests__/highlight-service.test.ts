import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HighlightMatchType } from '../../../../common/setting/types.js';
import { HighlightSettingServiceImpl } from '../highlight.service.js';
import { buildHighlightSetting } from '../highlight.utils.js';
import type { HighlightSettingService } from '../types.js';

vi.mock('../../../logger/logger.factory.ts');

describe('highlight-service', () => {
  let highlightService: HighlightSettingService;

  beforeEach(() => {
    highlightService = new HighlightSettingServiceImpl();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#get', () => {
    it('should return empty settings', () => {
      const settings = highlightService.get();

      expect(settings.length).toBe(0);
    });

    it('should return loaded settings', async () => {
      await highlightService.load({
        filePath: path.join(__dirname, 'file.cfg'),
      });

      const settings = highlightService.get();

      expect(settings.length).not.toBe(0);
    });
  });

  describe('#load', () => {
    it('should parse settings from file', async () => {
      await highlightService.load({
        filePath: path.join(__dirname, 'file.cfg'),
      });

      const settings = highlightService.get();

      expect(settings.length).toBe(8);

      const setting0 = buildHighlightSetting({
        matchType: HighlightMatchType.CONTAINS,
        text: 'text 0',
        foregroundColor: 'fg0',
        backgroundColor: '',
        className: 'class 0',
      });
      expect(settings[0]).toEqual(setting0);

      const setting1 = buildHighlightSetting({
        matchType: HighlightMatchType.CONTAINS,
        text: 'text 1',
        foregroundColor: 'fg1',
        backgroundColor: 'bg1',
        className: 'class 1',
      });
      expect(settings[1]).toEqual(setting1);

      const setting2 = buildHighlightSetting({
        matchType: HighlightMatchType.STARTS,
        text: 'text 2',
        foregroundColor: 'fg2',
        backgroundColor: '',
        className: 'class 2',
      });
      expect(settings[2]).toEqual(setting2);

      const setting3 = buildHighlightSetting({
        matchType: HighlightMatchType.STARTS,
        text: 'text 3',
        foregroundColor: 'fg3',
        backgroundColor: 'bg3',
        className: 'class 3',
      });
      expect(settings[3]).toEqual(setting3);

      const setting4 = buildHighlightSetting({
        matchType: HighlightMatchType.REGEX,
        text: 'text 4',
        foregroundColor: 'fg4',
        backgroundColor: '',
        className: 'class 4',
      });
      expect(settings[4]).toEqual(setting4);

      const setting5 = buildHighlightSetting({
        matchType: HighlightMatchType.REGEX,
        text: 'text 5',
        foregroundColor: 'fg5',
        backgroundColor: 'bg5',
        className: 'class 5',
      });
      expect(settings[5]).toEqual(setting5);

      const setting6 = buildHighlightSetting({
        matchType: HighlightMatchType.EXACT,
        text: 'text 6',
        foregroundColor: 'fg6',
        backgroundColor: '',
        className: 'class 6',
      });
      expect(settings[6]).toEqual(setting6);

      const setting7 = buildHighlightSetting({
        matchType: HighlightMatchType.EXACT,
        text: 'text 7',
        foregroundColor: 'fg7',
        backgroundColor: 'bg7',
        className: 'class 7',
      });
      expect(settings[7]).toEqual(setting7);
    });

    it('should skip incomplete settings', async () => {
      await highlightService.load({
        filePath: path.join(__dirname, 'file2.cfg'),
      });

      const settings = highlightService.get();

      expect(settings.length).toBe(1);

      const setting0 = buildHighlightSetting({
        matchType: HighlightMatchType.CONTAINS,
        text: 'text 0',
        foregroundColor: 'fg0',
        backgroundColor: '',
        className: '',
      });
      expect(settings[0]).toEqual(setting0);
    });

    it('should append to previously loaded settings', async () => {
      await highlightService.load({
        filePath: path.join(__dirname, 'file.cfg'),
      });

      expect(highlightService.get().length).toBe(8);

      await highlightService.load({
        filePath: path.join(__dirname, 'file.cfg'),
        mode: 'append',
      });

      expect(highlightService.get().length).toBe(16);
    });

    it('should replace previously loaded settings', async () => {
      await highlightService.load({
        filePath: path.join(__dirname, 'file.cfg'),
      });

      expect(highlightService.get().length).toBe(8);

      await highlightService.load({
        filePath: path.join(__dirname, 'file.cfg'),
        mode: 'replace',
      });

      expect(highlightService.get().length).toBe(8);
    });
  });

  describe('#clear', () => {
    it('should clear settings', async () => {
      await highlightService.load({
        filePath: path.join(__dirname, 'file.cfg'),
      });

      highlightService.clear();

      const settings = highlightService.get();

      expect(settings.length).toBe(0);
    });
  });
});
