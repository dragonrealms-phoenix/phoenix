import { describe, expect, it } from 'vitest';
import { isBlank } from '../is-blank.js';

describe('is-blank', () => {
  it.each([undefined, null, '', '  ', '\n'])(
    'returns true when string is `%s`q',
    async (text: null | undefined | string) => {
      expect(isBlank(text)).toBe(true);
    }
  );

  it.each(['a', ' a', 'a ', ' a '])(
    'returns false when string is `%s`',
    async (text: string) => {
      expect(isBlank(text)).toBe(false);
    }
  );
});
