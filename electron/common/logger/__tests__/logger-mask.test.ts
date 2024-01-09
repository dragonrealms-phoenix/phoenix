import { isNotMaskable, maskSensitiveValues } from '../logger.mask';

describe('logger-mask', () => {
  describe('#maskSensitiveValues', () => {
    const data: Record<string, any> = {
      key: 'key1',
      password: 'password1',
      apiKey: 'apiKey1',
      credential: 'credential1',
      nested: {
        key: 'key2',
        password: 'password2',
        apiKey: 'apiKey2',
        credential: 'credential2',
      },
    };

    it('should mask password and key properties by default', () => {
      const result = maskSensitiveValues({
        json: data,
      });

      expect(result).toEqual({
        key: '***REDACTED***',
        password: '***REDACTED***',
        apiKey: 'apiKey1',
        credential: 'credential1',
        nested: {
          key: '***REDACTED***',
          password: '***REDACTED***',
          apiKey: 'apiKey2',
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
        key: 'key1',
        password: 'password1',
        apiKey: '***REDACTED***',
        credential: '***REDACTED***',
        nested: {
          key: 'key2',
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
        key: 'key1',
        password: 'password1',
        apiKey: '***MASKED***',
        credential: '***MASKED***',
        nested: {
          key: 'key2',
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
