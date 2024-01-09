import {
  equalsIgnoreCase,
  includesIgnoreCase,
  sliceStart,
  toUpperSnakeCase,
  unescapeEntities,
} from '../string.utils';

describe('string-utils', () => {
  describe('#includesIgnoreCase', () => {
    test('when the value is included in the array then returns true', () => {
      const values = ['foo', 'bar', 'baz'];
      const valueToFind = 'bar';

      const result = includesIgnoreCase(values, valueToFind);

      expect(result).toEqual(true);
    });

    test('when the value is not included in the array then returns false', () => {
      const values = ['foo', 'bar', 'baz'];
      const valueToFind = 'qux';

      const result = includesIgnoreCase(values, valueToFind);

      expect(result).toEqual(false);
    });

    test('when value is included in the array but with different casing then returns true', () => {
      const values = ['foo', 'bar', 'baz'];
      const valueToFind = 'BAR';

      const result = includesIgnoreCase(values, valueToFind);

      expect(result).toEqual(true);
    });

    test('when value is undefined then returns false', () => {
      const values = ['foo', 'bar', 'baz'];
      const valueToFind = undefined;

      const result = includesIgnoreCase(values, valueToFind);

      expect(result).toEqual(false);
    });
  });

  describe('#equalsIgnoreCase', () => {
    test('when the values are equal then returns true', () => {
      const value1 = 'foo';
      const value2 = 'foo';

      const result = equalsIgnoreCase(value1, value2);

      expect(result).toEqual(true);
    });

    test('when the values are not equal then returns false', () => {
      const value1 = 'foo';
      const value2 = 'bar';

      const result = equalsIgnoreCase(value1, value2);

      expect(result).toEqual(false);
    });

    test('when the values are equal but with different casing then returns true', () => {
      const value1 = 'foo';
      const value2 = 'FOO';

      const result = equalsIgnoreCase(value1, value2);

      expect(result).toEqual(true);
    });

    test('when first value is undefined then returns false', () => {
      const value1 = undefined;
      const value2 = 'foo';

      const result = equalsIgnoreCase(value1, value2);

      expect(result).toEqual(false);
    });

    test('when second value is undefined then returns false', () => {
      const value1 = 'foo';
      const value2 = undefined;

      const result = equalsIgnoreCase(value1, value2);

      expect(result).toEqual(false);
    });

    test('when both values are undefined then returns true', () => {
      const value1 = undefined;
      const value2 = undefined;

      const result = equalsIgnoreCase(value1, value2);

      expect(result).toEqual(true);
    });
  });

  describe('#toUpperSnakeCase', () => {
    test('when the value is not camel case then returns the value', () => {
      const value = 'foo';

      const result = toUpperSnakeCase(value);

      expect(result).toEqual('FOO');
    });

    test('when the value is camel case then returns the value in upper snake case', () => {
      const value = 'fooBarBaz';

      const result = toUpperSnakeCase(value);

      expect(result).toEqual('FOO_BAR_BAZ');
    });
  });

  describe('#sliceStart', () => {
    test('when the pattern is found at the start of the string then returns the original string, the matched pattern, and the remaining string', () => {
      const text = 'foo bar baz';
      const regex = /^(foo)/;

      const result = sliceStart({ text, regex });

      expect(result).toEqual({
        match: 'foo',
        original: 'foo bar baz',
        remaining: ' bar baz',
      });
    });

    test('when the pattern is not found at the start of the string then returns the original string, undefined for the matched pattern, and the original string for the remaining string', () => {
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

  describe('#unescapeEntities', () => {
    test('when the text does not contain any entities then returns the original text', () => {
      const text = 'foo bar baz';

      const result = unescapeEntities(text);

      expect(result).toEqual('foo bar baz');
    });

    test('when the text contains an entity then returns the text with the entity unescaped', () => {
      const text = '&lt;foo&gt;';

      const result = unescapeEntities(text);

      expect(result).toEqual('<foo>');
    });

    test('when the text contains multiple entities then returns the text with the entities unescaped', () => {
      const text = '&lt;foo&gt;&lt;bar&gt;';

      const result = unescapeEntities(text);

      expect(result).toEqual('<foo><bar>');
    });

    test('when the text contains an unknown entity then returns the text with the entity unescaped', () => {
      const text = '&bt;';

      const result = unescapeEntities(text);

      expect(result).toEqual('&bt;');
    });

    test('when custom entities are provided then returns the text with the entities unescaped', () => {
      const text = '&foo;';

      const result = unescapeEntities(text, { entities: { foo: 'bar' } });

      expect(result).toEqual('bar');
    });
  });
});
