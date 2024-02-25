import { describe, expect, it } from 'vitest';
import { toUpperSnakeCase } from '../to-upper-snake-case.js';

describe('string-utils', () => {
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
