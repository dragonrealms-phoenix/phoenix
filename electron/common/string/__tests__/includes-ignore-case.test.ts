import { describe, expect, it } from 'vitest';
import { includesIgnoreCase } from '../includes-ignore-case.js';

describe('includes-ignore-case', () => {
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
