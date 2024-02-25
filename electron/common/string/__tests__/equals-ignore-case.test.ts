import { describe, expect, it } from 'vitest';
import { equalsIgnoreCase } from '../equals-ignore-case.js';

describe('equals-ignore-case', () => {
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
