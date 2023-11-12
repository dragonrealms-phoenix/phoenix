import { includesIgnoreCase } from '../string.utils';

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
});
