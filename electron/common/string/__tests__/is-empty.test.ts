import { describe, expect, it } from 'vitest';
import { isEmpty } from '../is-empty.js';

describe('is-empty', () => {
  it.each([undefined, null, ''])(
    'returns true when string is `%s`',
    async (text: null | undefined | string) => {
      expect(isEmpty(text)).toBe(true);
    }
  );

  it.each(['a', ' a', 'a ', ' a ', '  ', '\n'])(
    'returns false when string is `%s`',
    async (text: string) => {
      expect(isEmpty(text)).toBe(false);
    }
  );
});
