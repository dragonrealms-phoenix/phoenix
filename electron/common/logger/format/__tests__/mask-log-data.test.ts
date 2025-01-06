import { describe, expect, it } from 'vitest';
import {
  isNotMaskable,
  maskLogData,
  maskSensitiveValues,
} from '../mask-log-data.js';

describe('mask-log-data', () => {
  describe('#maskLogData', () => {
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
      const result = maskLogData(data);

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
  });

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
  });

  describe('#isNotMaskable', () => {
    it('returns true for null', () => {
      expect(isNotMaskable(null)).toBe(true);
    });

    it('returns true for undefined', () => {
      expect(isNotMaskable(undefined)).toBe(true);
    });

    it('returns true for Date', () => {
      expect(isNotMaskable(new Date())).toBe(true);
    });

    it('returns true for string', () => {
      expect(isNotMaskable('string')).toBe(true);
    });

    it('returns true for number', () => {
      expect(isNotMaskable(42)).toBe(true);
    });

    it('returns true for boolean', () => {
      expect(isNotMaskable(true)).toBe(true);
    });

    it('returns false for object', () => {
      expect(isNotMaskable({ foo: 42 })).toBe(false);
    });
  });
});
