import { describe, expect, it } from 'vitest';
import { sliceStart } from '../slice-start.js';

describe('slice-start', () => {
  it('returns the original string, the matched pattern, and the remaining string when the pattern is found at the start of the string', () => {
    const text = 'foo bar baz';
    const regex = /^(foo)/;

    const result = sliceStart({ text, regex });

    expect(result).toEqual({
      match: 'foo',
      original: 'foo bar baz',
      remaining: ' bar baz',
    });
  });

  it('returns the original string, undefined for the matched pattern, and the original string for the remaining string when the pattern is not found at the start of the string', () => {
    const text = 'foo bar baz';
    const regex = /^(bar)/;

    const result = sliceStart({ text, regex });

    expect(result).toEqual({
      match: undefined,
      original: 'foo bar baz',
      remaining: 'foo bar baz',
    });
  });
});
