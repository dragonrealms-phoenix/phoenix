import { describe, expect, it } from 'vitest';
import {
  equalsIgnoreCase,
  includesIgnoreCase,
  isBlank,
  isEmpty,
  sliceStart,
  toUpperSnakeCase,
  unescapeEntities,
} from '../string.utils.js';

describe('string-utils', () => {
  describe('#unescapeEntities', () => {
    it('unescapes HTML entities in the text', () => {
      const text = '&lt;div&gt;Hello, &amp;world!&lt;/div&gt;';
      const expected = '<div>Hello, &world!</div>';
      const result = unescapeEntities(text);
      expect(result).toEqual(expected);
    });

    it('unescapes custom entities', () => {
      const text = '&customEntity1; &customEntity2;';
      const options = {
        entities: {
          customEntity1: 'Custom 1',
          customEntity2: 'Custom 2',
        },
      };
      const expected = 'Custom 1 Custom 2';
      const result = unescapeEntities(text, options);
      expect(result).toEqual(expected);
    });

    it('does not unescape unknown entities', () => {
      const text = '&unknownEntity;';
      const expected = '&unknownEntity;';
      const result = unescapeEntities(text);
      expect(result).toEqual(expected);
    });
  });

  describe('#equalsIgnoreCase', () => {
    it('returns true when the values are equal', () => {
      const value1 = 'foo';
      const value2 = 'foo';

      const result = equalsIgnoreCase(value1, value2);

      expect(result).toEqual(true);
    });

    it('returns false when the values are not equal', () => {
      const value1 = 'foo';
      const value2 = 'bar';

      const result = equalsIgnoreCase(value1, value2);

      expect(result).toEqual(false);
    });

    it('returns true when the values are equal but with different casing', () => {
      const value1 = 'foo';
      const value2 = 'FOO';

      const result = equalsIgnoreCase(value1, value2);

      expect(result).toEqual(true);
    });

    it('returns false when first value is undefined', () => {
      const value1 = undefined;
      const value2 = 'foo';

      const result = equalsIgnoreCase(value1, value2);

      expect(result).toEqual(false);
    });

    it('returns false when second value is undefined', () => {
      const value1 = 'foo';
      const value2 = undefined;

      const result = equalsIgnoreCase(value1, value2);

      expect(result).toEqual(false);
    });

    it('returns true when both values are undefined', () => {
      const value1 = undefined;
      const value2 = undefined;

      const result = equalsIgnoreCase(value1, value2);

      expect(result).toEqual(true);
    });
  });

  describe('#includesIgnoreCase', () => {
    it('returns true when the value is included in the array', () => {
      const values = ['foo', 'bar', 'baz'];
      const valueToFind = 'bar';

      const result = includesIgnoreCase(values, valueToFind);

      expect(result).toEqual(true);
    });

    it('returns false when the value is not included in the array', () => {
      const values = ['foo', 'bar', 'baz'];
      const valueToFind = 'qux';

      const result = includesIgnoreCase(values, valueToFind);

      expect(result).toEqual(false);
    });

    it('returns true when value is included in the array but with different casing', () => {
      const values = ['foo', 'bar', 'baz'];
      const valueToFind = 'BAR';

      const result = includesIgnoreCase(values, valueToFind);

      expect(result).toEqual(true);
    });

    it('returns false when value is undefined', () => {
      const values = ['foo', 'bar', 'baz'];
      const valueToFind = undefined;

      const result = includesIgnoreCase(values, valueToFind);

      expect(result).toEqual(false);
    });
  });

  describe('#isBlank', () => {
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

  describe('#isEmpty', () => {
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

  describe('#toUpperSnakeCase', () => {
    it('returns the value when the value is not camel case', () => {
      const value = 'foo';

      const result = toUpperSnakeCase(value);

      expect(result).toEqual('FOO');
    });

    it('returns the value in upper snake case when the value is camel case', () => {
      const value = 'fooBarBaz';

      const result = toUpperSnakeCase(value);

      expect(result).toEqual('FOO_BAR_BAZ');
    });
  });

  describe('#sliceStart', () => {
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
});
