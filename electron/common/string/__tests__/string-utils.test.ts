import {
  equalsIgnoreCase,
  includesIgnoreCase,
  toUpperSnakeCase,
} from '../string.utils';

describe('string-utils', () => {
  describe('#includesIgnoreCase', () => {
    test('when the value is included in the array then returns true', () => {
      const values = ['foo', 'bar', 'baz'];
      const valueToFind = 'bar';

      const result = includesIgnoreCase(values, valueToFind);

      expect(result).toBe(true);
    });

    test('when the value is not included in the array then returns false', () => {
      const values = ['foo', 'bar', 'baz'];
      const valueToFind = 'qux';

      const result = includesIgnoreCase(values, valueToFind);

      expect(result).toBe(false);
    });

    test('when value is included in the array but with different casing then returns true', () => {
      const values = ['foo', 'bar', 'baz'];
      const valueToFind = 'BAR';

      const result = includesIgnoreCase(values, valueToFind);

      expect(result).toBe(true);
    });
  });

  describe('#equalsIgnoreCase', () => {
    test('when the values are equal then returns true', () => {
      const value1 = 'foo';
      const value2 = 'foo';

      const result = equalsIgnoreCase(value1, value2);

      expect(result).toBe(true);
    });

    test('when the values are not equal then returns false', () => {
      const value1 = 'foo';
      const value2 = 'bar';

      const result = equalsIgnoreCase(value1, value2);

      expect(result).toBe(false);
    });

    test('when the values are equal but with different casing then returns true', () => {
      const value1 = 'foo';
      const value2 = 'FOO';

      const result = equalsIgnoreCase(value1, value2);

      expect(result).toBe(true);
    });

    test('when first value is undefined then returns false', () => {
      const value1 = undefined;
      const value2 = 'foo';

      const result = equalsIgnoreCase(value1, value2);

      expect(result).toBe(false);
    });

    test('when second value is undefined then returns false', () => {
      const value1 = 'foo';
      const value2 = undefined;

      const result = equalsIgnoreCase(value1, value2);

      expect(result).toBe(false);
    });

    test('when both values are undefined then returns true', () => {
      const value1 = undefined;
      const value2 = undefined;

      const result = equalsIgnoreCase(value1, value2);

      expect(result).toBe(true);
    });
  });

  describe('#toUpperSnakeCase', () => {
    test('when the value is not camel case then returns the value', () => {
      const value = 'foo';

      const result = toUpperSnakeCase(value);

      expect(result).toBe('FOO');
    });

    test('when the value is camel case then returns the value in upper snake case', () => {
      const value = 'fooBarBaz';

      const result = toUpperSnakeCase(value);

      expect(result).toBe('FOO_BAR_BAZ');
    });
  });
});
