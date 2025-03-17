import { describe, expect, it } from 'vitest';
import { getCachedRegExp } from '../regex.cache.js';

describe('regex-cache', () => {
  describe('#getCachedRegExp', () => {
    it('caches regexp objects by pattern and flags', async () => {
      const pattern1 = 'pattern one';
      const pattern2 = 'pattern two';

      const flags1 = '';
      const flags2 = 'g';
      const flags3 = 'd';
      const flags4 = 'dg';

      /*
       * Pattern 1
       */

      const regex1 = getCachedRegExp(pattern1, flags1);
      const regex2 = getCachedRegExp(pattern1, flags2);
      const regex3 = getCachedRegExp(pattern1, flags3);
      const regex4 = getCachedRegExp(pattern1, flags4);

      // Assert same pattern and falgs are equal
      expect(regex1).toStrictEqual(getCachedRegExp(pattern1, flags1));
      expect(regex2).toStrictEqual(getCachedRegExp(pattern1, flags2));
      expect(regex3).toStrictEqual(getCachedRegExp(pattern1, flags3));
      expect(regex4).toStrictEqual(getCachedRegExp(pattern1, flags4));

      // Assert that same pattern but different flags are not equal
      expect(regex1).not.toBe(regex2);
      expect(regex2).not.toBe(regex3);
      expect(regex3).not.toBe(regex4);

      /*
       * Pattern 2
       */

      const regex5 = getCachedRegExp(pattern2, flags1);
      const regex6 = getCachedRegExp(pattern2, flags2);
      const regex7 = getCachedRegExp(pattern2, flags3);
      const regex8 = getCachedRegExp(pattern2, flags4);

      // Assert same pattern and falgs are equal
      expect(regex5).toStrictEqual(getCachedRegExp(pattern2, flags1));
      expect(regex6).toStrictEqual(getCachedRegExp(pattern2, flags2));
      expect(regex7).toStrictEqual(getCachedRegExp(pattern2, flags3));
      expect(regex8).toStrictEqual(getCachedRegExp(pattern2, flags4));

      // Assert that same pattern but different flags are not equal
      expect(regex5).not.toBe(regex6);
      expect(regex6).not.toBe(regex7);
      expect(regex7).not.toBe(regex8);

      // Assert that same flags but different patterns are not equal
      expect(regex1).not.toBe(regex5);
      expect(regex2).not.toBe(regex6);
      expect(regex3).not.toBe(regex7);
      expect(regex4).not.toBe(regex8);
    });

    it('resets lastIndex to 0', async () => {
      const text = 'The quick brown fox jumped over the sleeping fox';

      const regex = getCachedRegExp('fox', 'g');
      expect(regex.lastIndex).toBe(0);

      // Find the first 'fox'
      const match0 = regex.exec(text);
      expect(match0).not.toBeNull();
      expect(regex.lastIndex).toBe(19);

      // Find the second 'fox'
      const match1 = regex.exec(text);
      expect(match1).not.toBeNull();
      expect(regex.lastIndex).toBe(48);

      // Get regex from cache and the index is reset
      const regex2 = getCachedRegExp('fox', 'g');
      expect(regex).toBe(regex2);
      expect(regex.lastIndex).toBe(0);
    });
  });
});
