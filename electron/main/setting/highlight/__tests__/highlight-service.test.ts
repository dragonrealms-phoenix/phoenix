import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { HighlightSetting } from '../../../../common/setting/types.js';
import { HighlightMatchType } from '../../../../common/setting/types.js';
import { HighlightSettingServiceImpl } from '../highlight.service.js';
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
    it('should return empty highlights', () => {
      const highlights = highlightService.get();

      expect(highlights.length).toBe(0);
    });

    it('should return loaded highlights', async () => {
      await highlightService.load({
        filePath: path.join(__dirname, 'file.cfg'),
      });

      const highlights = highlightService.get();

      expect(highlights.length).not.toBe(0);
    });
  });

  describe('#load', () => {
    it('should parse highlights from file', async () => {
      await highlightService.load({
        filePath: path.join(__dirname, 'file.cfg'),
      });

      const highlights = highlightService.get();

      expect(highlights.length).toBe(8);

      const highlight0: HighlightSetting = {
        matchType: HighlightMatchType.CONTAINS,
        pattern: 'pattern 0',
        foregroundColor: 'fg0',
        backgroundColor: '',
        className: 'class 0',
      };
      expect(highlights[0]).toEqual(highlight0);

      const highlight1: HighlightSetting = {
        matchType: HighlightMatchType.CONTAINS,
        pattern: 'pattern 1',
        foregroundColor: 'fg1',
        backgroundColor: 'bg1',
        className: 'class 1',
      };
      expect(highlights[1]).toEqual(highlight1);

      const highlight2: HighlightSetting = {
        matchType: HighlightMatchType.STARTS,
        pattern: 'pattern 2',
        foregroundColor: 'fg2',
        backgroundColor: '',
        className: 'class 2',
      };
      expect(highlights[2]).toEqual(highlight2);

      const highlight3: HighlightSetting = {
        matchType: HighlightMatchType.STARTS,
        pattern: 'pattern 3',
        foregroundColor: 'fg3',
        backgroundColor: 'bg3',
        className: 'class 3',
      };
      expect(highlights[3]).toEqual(highlight3);

      const highlight4: HighlightSetting = {
        matchType: HighlightMatchType.REGEX,
        pattern: 'pattern 4',
        foregroundColor: 'fg4',
        backgroundColor: '',
        className: 'class 4',
      };
      expect(highlights[4]).toEqual(highlight4);

      const highlight5: HighlightSetting = {
        matchType: HighlightMatchType.REGEX,
        pattern: 'pattern 5',
        foregroundColor: 'fg5',
        backgroundColor: 'bg5',
        className: 'class 5',
      };
      expect(highlights[5]).toEqual(highlight5);

      const highlight6: HighlightSetting = {
        matchType: HighlightMatchType.EXACT,
        pattern: 'pattern 6',
        foregroundColor: 'fg6',
        backgroundColor: '',
        className: 'class 6',
      };
      expect(highlights[6]).toEqual(highlight6);

      const highlight7: HighlightSetting = {
        matchType: HighlightMatchType.EXACT,
        pattern: 'pattern 7',
        foregroundColor: 'fg7',
        backgroundColor: 'bg7',
        className: 'class 7',
      };
      expect(highlights[7]).toEqual(highlight7);
    });

    it('should append to previously loaded highlights', async () => {
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

    it('should replace previously loaded highlights', async () => {
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
    it('should clear highlights', async () => {
      await highlightService.load({
        filePath: path.join(__dirname, 'file.cfg'),
      });

      highlightService.clear();

      const highlights = highlightService.get();

      expect(highlights.length).toBe(0);
    });
  });
});
