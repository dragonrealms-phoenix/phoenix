import path from 'node:path';
import process from 'node:process';
import { afterEach, beforeEach, describe, it, vi } from 'vitest';
import type { StyledTextSegment } from '../../../../common/game/types.js';
import { HighlightSettingServiceImpl } from '../highlight.service.js';
import type { HighlightSetting, HighlightSettingService } from '../types.js';
import { HighlightMatchType } from '../types.js';

vi.mock('../../../logger/logger.factory.ts');

describe('highlight-service', () => {
  let highlightService: HighlightSettingService;

  beforeEach(() => {
    highlightService = new HighlightSettingServiceImpl({
      filePath: path.join(
        process.cwd(),
        'electron',
        'main',
        'setting',
        'highlight',
        '__tests__',
        'file.cfg'
      ),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#load', () => {
    it('should load highlights from file', async () => {
      const highlights = await highlightService.load();

      /**
       * Apply multiple regex patterns to highlight only captured groups in a line of text.
       */
      const applyHighlights = (
        text: string,
        patterns: Array<HighlightSetting>
      ): Array<StyledTextSegment> => {
        const matches: Array<StyledTextSegment> = [];

        // Collect matches for only the captured groups using `match.indices`
        for (const pattern of patterns) {
          const { matchType } = pattern;
          if (matchType !== HighlightMatchType.REGEX) {
            continue;
          }
          const regex = new RegExp(pattern.pattern, 'dg');
          let match: RegExpExecArray | null;
          while ((match = regex.exec(text)) !== null) {
            if (match.indices) {
              for (let i = 1; i < match.indices.length; i += 1) {
                const [start, end] = match.indices[i];
                matches.push({
                  text: text.slice(start, end),
                  start,
                  end,
                  fgColor: pattern.fgColor,
                  bgColor: pattern.bgColor,
                });
              }
            }
          }
        }

        // Sort matches by start index
        matches.sort((a, b) => a.start - b.start);

        // Process text into non-overlapping highlighted segments
        const result: Array<StyledTextSegment> = [];
        let currentIndex = 0;

        for (const { start, end, fgColor, bgColor } of matches) {
          if (start >= currentIndex) {
            // Add unstyled text before the match
            if (start > currentIndex) {
              result.push({
                text: text.slice(currentIndex, start),
                start: currentIndex,
                end: start,
              });
            }
            // Add highlighted text
            result.push({
              text: text.slice(start, end),
              start,
              end,
              fgColor,
              bgColor,
            });
            currentIndex = end;
          }
        }

        // Add remaining unstyled text
        if (currentIndex < text.length) {
          result.push({
            text: text.slice(currentIndex),
            start: currentIndex,
            end: text.length,
          });
        }

        return result;
      };

      // Example usage
      const text =
        "You compare your assassin's blade with the iron yardstick several times and are certain the length measures ten spans, the width measures one span and the height measures one span.\n";

      const highlightedText = applyHighlights(text, highlights);
      console.log(highlightedText);
    });

    it.only('chatgpt', async () => {
      type Highlight = {
        text: string;
        start: number;
        end: number;
        color: string;
      };

      type StyledSegment = {
        text: string;
        start: number;
        end: number;
        color: string;
      };

      function buildSegments(
        text: string,
        patterns: Array<{ regex: RegExp; color: string }>
      ): Array<StyledSegment> {
        const matches: Array<Highlight> = [];

        for (const pattern of patterns) {
          const color = pattern.color;
          const regex = pattern.regex;
          let match: RegExpExecArray | null;
          while ((match = regex.exec(text)) !== null) {
            if (match.indices) {
              for (let i = 1; i < match.indices.length; i += 1) {
                const [start, end] = match.indices[i] || [];
                if (start !== undefined && end !== undefined) {
                  matches.push({ text: match[i], start, end, color });
                }
              }
            }
          }
        }

        matches.sort((a, b) => a.start - b.start || a.end - b.end);

        const result: Array<StyledSegment> = [];
        let currentIndex = 0;

        for (const { start, end, color } of matches) {
          if (start > currentIndex) {
            result.push({
              text: text.slice(currentIndex, start),
              start: currentIndex,
              end: start,
              color: '',
            });
          }

          if (result.length > 0 && result[result.length - 1].end > start) {
            const lastSegment = result.pop()!;
            if (lastSegment.start < start) {
              result.push({
                text: text.slice(lastSegment.start, start),
                start: lastSegment.start,
                end: start,
                color: lastSegment.color,
              });
            }
            result.push({
              text: text.slice(start, end),
              start,
              end,
              color,
            });
            if (end < lastSegment.end) {
              result.push({
                text: text.slice(end, lastSegment.end),
                start: end,
                end: lastSegment.end,
                color: lastSegment.color,
              });
            }
          } else {
            result.push({
              text: text.slice(start, end),
              start,
              end,
              color,
            });
          }

          currentIndex = end;
        }

        if (currentIndex < text.length) {
          result.push({
            text: text.slice(currentIndex),
            start: currentIndex,
            end: text.length,
            color: '',
          });
        }

        return result;
      }

      // Example usage
      const text = 'certain the length measures ten spans';
      const patterns = [
        {
          regex: /((?:length|width|height) measures (?:[\w\s-]+?) spans?)/dg,
          color: 'red',
        },
        {
          regex: /measures ([\w\s-]+?) span/dg,
          color: 'blue',
        },
      ];

      console.log(text);
      const highlightedText = buildSegments(text, patterns);
      console.log(highlightedText);
    });
  });
});
/*

  line = "certain the length measures ten spans, the width measures one span and the height measures one span.\n"

  matchesByStart = [
    { start: 12, end: 37, fgColor, bgColor, "length measures ten spans" },
    { start: 28, end: 31, fgColor, bgColor, "ten" },
  ]

  matchesByEnd = [
    { start: 28, end: 31, fgColor, bgColor, "ten" },
    { start: 12, end: 37, fgColor, bgColor, "length measures ten spans" },
  ]

  results = []
  tagStack = []
  currentIndex = 0
  currMatch = nil
  prevMatch = nil

  for (const i = 0; i < matches.length; i += 1) {
    prevMatch = matches[i-1];
    currMatch = matches[i];

    if (!prevMatch) {
      if (currMatch.start >= currentIndex) {
        if (currMatch.start > currentIndex) {
          results.push(line.slice(currentIndex, currMatch.start))
        }
        tagStack.push(match)
        results.push(line.slice(currMatch.start, currMatch.end))
      }
    }


  }

  //--
  certain the length measures ten spans, the width measures one span and the height measures one span.\n

  quick sly fox jumps
  quick <span style="color:red">sly fox</span> jumps
  quick <span style="color:red">sly <span style="color:blue">fox jumps</span></span>
  //--

*/
