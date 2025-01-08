import { describe, expect, it } from 'vitest';
import { maskSensitiveValues } from '../sanitize.utils.js';

describe('sanitize-utils', () => {
  describe('#maskSensitiveValues', () => {
    const data: Record<string, any> = {
      accessToken: 'accessToken1',
      password: 'password1',
      apiKey: 'apiKey1',
      credential: 'credential1',
      nested: {
        accessToken: 'accessToken2',
        password: 'password2',
        apiKey: 'apiKey2',
        credential: 'credential2',
      },
    };

    it('masks password, accessToken, and apiKey properties by default', () => {
      const result = maskSensitiveValues({
        object: data,
      });

      expect(result).toEqual({
        accessToken: '***REDACTED***',
        password: '***REDACTED***',
        apiKey: '***REDACTED***',
        credential: 'credential1',
        nested: {
          accessToken: '***REDACTED***',
          password: '***REDACTED***',
          apiKey: '***REDACTED***',
          credential: 'credential2',
        },
      });
    });

    it('masks specified properties', () => {
      const result = maskSensitiveValues({
        object: data,
        keys: ['apiKey', 'credential'],
      });

      expect(result).toEqual({
        accessToken: 'accessToken1',
        password: 'password1',
        apiKey: '***REDACTED***',
        credential: '***REDACTED***',
        nested: {
          accessToken: 'accessToken2',
          password: 'password2',
          apiKey: '***REDACTED***',
          credential: '***REDACTED***',
        },
      });
    });

    it('masks specified properties with custom mask', () => {
      const result = maskSensitiveValues({
        object: data,
        keys: ['apiKey', 'credential'],
        mask: '***MASKED***',
      });

      expect(result).toEqual({
        accessToken: 'accessToken1',
        password: 'password1',
        apiKey: '***MASKED***',
        credential: '***MASKED***',
        nested: {
          accessToken: 'accessToken2',
          password: 'password2',
          apiKey: '***MASKED***',
          credential: '***MASKED***',
        },
      });
    });

    it.each([
      undefined,
      null,
      new Date(),
      'string',
      42,
      true,
      false,
      [],
      [1],
      new Map(),
      new Set(),
    ])('does not mask non-objects: %s', (nonObject: any) => {
      expect(
        maskSensitiveValues({
          object: nonObject,
        })
      ).toBe(nonObject);
    });
  });
});
