import { isNotMaskable, maskSensitiveValues } from '../logger.mask';

describe('logger-mask', () => {
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

    it('should mask password, accessToken, and apiKey properties by default', () => {
      const result = maskSensitiveValues({
        json: data,
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

    it('should mask specified properties', () => {
      const result = maskSensitiveValues({
        json: data,
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

    it('should mask specified properties with custom mask', () => {
      const result = maskSensitiveValues({
        json: data,
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
    it('should return true for null', () => {
      expect(isNotMaskable(null)).toBeTruthy();
    });

    it('should return true for undefined', () => {
      expect(isNotMaskable(undefined)).toBeTruthy();
    });

    it('should return true for Date', () => {
      expect(isNotMaskable(new Date())).toBeTruthy();
    });

    it('should return true for string', () => {
      expect(isNotMaskable('string')).toBeTruthy();
    });

    it('should return true for number', () => {
      expect(isNotMaskable(42)).toBeTruthy();
    });

    it('should return true for boolean', () => {
      expect(isNotMaskable(true)).toBeTruthy();
    });

    it('should return false for object', () => {
      expect(isNotMaskable({ foo: 42 })).toBeFalsy();
    });
  });
});
