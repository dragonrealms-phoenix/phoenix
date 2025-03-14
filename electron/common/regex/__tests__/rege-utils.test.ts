import { describe, expect, it } from 'vitest';
import {
  filterToMinimalCompleteMatches,
  getAllMatches,
} from '../regex.utils.js';

describe('regex-utils', () => {
  describe('#filterToMinimalCompleteMatches', () => {
    const text = 'The quick brown fox jumps over the lazy dog';

    it('filters out nested matches', async () => {
      const pattern = 'The quick (brown (fox)) jumps over the ((lazy) dog)';

      const matches = getAllMatches({ text, pattern });

      expect(matches).toEqual([
        { text: 'brown fox', start: 10, end: 19 },
        { text: 'fox', start: 16, end: 19 },
        { text: 'lazy dog', start: 35, end: 43 },
        { text: 'lazy', start: 35, end: 39 },
      ]);

      const filteredMatches = filterToMinimalCompleteMatches(matches);

      expect(filteredMatches).toEqual([
        { text: 'brown fox', start: 10, end: 19 },
        { text: 'lazy dog', start: 35, end: 43 },
      ]);
    });
  });

  describe('#getAllMatches', () => {
    const text = 'The quick brown fox jumps over the lazy dog';

    it('returns empty array when no matches are found', async () => {
      const pattern = 'Does not match the text';

      const matches = getAllMatches({ text, pattern });

      expect(matches).toEqual([]);
    });

    it('finds all captured groups in the text', async () => {
      const pattern = 'The (quick) brown (fox) jumps over the (lazy) dog';

      const matches = getAllMatches({ text, pattern });

      expect(matches).toEqual([
        { text: 'quick', start: 4, end: 9 },
        { text: 'fox', start: 16, end: 19 },
        { text: 'lazy', start: 35, end: 39 },
      ]);
    });

    it('finds nested captured groups in the text', async () => {
      const pattern = 'The quick (brown (fox)) jumps over the ((lazy) dog)';

      const matches = getAllMatches({ text, pattern });

      expect(matches).toEqual([
        { text: 'brown fox', start: 10, end: 19 },
        { text: 'fox', start: 16, end: 19 },
        { text: 'lazy dog', start: 35, end: 43 },
        { text: 'lazy', start: 35, end: 39 },
      ]);
    });

    it('ignores non-captured groups in the text', async () => {
      const pattern = 'The quick (?:brown) (fox) jumps over the (lazy) dog';

      const matches = getAllMatches({ text, pattern });

      expect(matches).toEqual([
        { text: 'fox', start: 16, end: 19 },
        { text: 'lazy', start: 35, end: 39 },
      ]);
    });
  });
});
