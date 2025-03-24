import { describe, expect, it } from 'vitest';
import {
  filterToMinimalCompleteMatches,
  getAllMatches,
  isMatch,
  replaceTokensWithMatches,
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

    it('finds all instances of pattern in the text', async () => {
      const pattern = '([aeiou]+)';

      const matches = getAllMatches({ text, pattern });

      expect(matches).toEqual([
        { text: 'e', start: 2, end: 3 }, // thE
        { text: 'ui', start: 5, end: 7 }, // qUIck
        { text: 'o', start: 12, end: 13 }, // brOwn
        { text: 'o', start: 17, end: 18 }, // fOx
        { text: 'u', start: 21, end: 22 }, // jUmps
        { text: 'o', start: 26, end: 27 }, // Over
        { text: 'e', start: 28, end: 29 }, // ovEr
        { text: 'e', start: 33, end: 34 }, // thE
        { text: 'a', start: 36, end: 37 }, // lAzy
        { text: 'o', start: 41, end: 42 }, // dOg
      ]);
    });
  });

  describe('#isMatch', () => {
    const text = 'The quick brown fox jumps over the lazy dog';

    it('returns false when no matches are found', async () => {
      const pattern = 'Does not match the text';

      const match = isMatch({ text, pattern });

      expect(match).toBe(false);
    });

    it('returns true when a match is found', async () => {
      const pattern = '^The (quick|agile) brown fox';

      const match = isMatch({ text, pattern });

      expect(match).toBe(true);
    });

    it('returns true when a match is found after trimming end', async () => {
      const pattern = '^The (quick|agile) brown fox';

      const match = isMatch({ text: text + '\n', pattern });

      expect(match).toBe(true);
    });
  });

  describe('#replaceTokensWithMatches', () => {
    it('replaces no tokens when no matches are found', async () => {
      const textToMatch = 'The quick brown fox jumps over the lazy dog';
      const pattern = 'Does not match the text';
      const textToReplace = 'The $1 dog is jumped over by the $2 $3';

      const result = replaceTokensWithMatches({
        textToMatch,
        textToReplace,
        pattern,
      });

      expect(result.patternMatchedText).toBeFalsy();
      expect(result.replacedText).toBe(textToReplace);
    });

    it('replaces tokens with matches', async () => {
      const textToMatch = 'The quick brown fox jumps over the lazy dog';
      const pattern = 'The (quick) brown (fox) jumps over the (lazy) dog';
      const textToReplace = 'The $3 dog is jumped over by the $1 $2';

      const result = replaceTokensWithMatches({
        textToMatch,
        textToReplace,
        pattern,
      });

      expect(result.patternMatchedText).toBeTruthy();
      expect(result.replacedText).not.toBe(textToReplace);
      expect(result.replacedText).toBe(
        'The lazy dog is jumped over by the quick fox'
      );
    });

    it('replaces duplicate tokens with matches', async () => {
      const textToMatch = 'The quick brown fox jumps over the lazy dog';
      const pattern = 'The (quick) brown (fox) jumps over the (lazy) dog';
      const textToReplace = '$1 $2 $3 $1 $2 $3';

      const result = replaceTokensWithMatches({
        textToMatch,
        textToReplace,
        pattern,
      });

      expect(result.patternMatchedText).toBeTruthy();
      expect(result.replacedText).not.toBe(textToReplace);
      expect(result.replacedText).toBe('quick fox lazy quick fox lazy');
    });

    it('leaves unmatched tokens as-is while replacing others', async () => {
      const textToMatch = 'The brown fox jumps over the lazy dog';
      const pattern = `The (quick )?brown (fox) jumps over the (lazy) dog`;
      const textToReplace = 'The $3 dog is jumped over by the $1 $2';

      const result = replaceTokensWithMatches({
        textToMatch,
        textToReplace,
        pattern,
      });

      expect(result.patternMatchedText).toBeTruthy();
      expect(result.replacedText).not.toBe(textToReplace);
      expect(result.replacedText).toBe(
        'The lazy dog is jumped over by the $1 fox'
      );
    });
  });
});
