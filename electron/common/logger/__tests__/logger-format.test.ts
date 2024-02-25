import { formatLogData } from '../logger.format';

class ErrorWithCode extends Error {
  public readonly code: number;

  constructor(message: string, code: number) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    Error.captureStackTrace(this, ErrorWithCode);
  }
}

describe('logger-format', () => {
  describe('#formatLogData', () => {
    it('should format empty object as empty object', () => {
      const data = {};

      const result = formatLogData(data);

      expect(result).toEqual({});
    });

    it('should format error as name and stack properties', () => {
      const data = {
        error: new Error('test'),
      };

      const result = formatLogData(data);

      expect(result).toEqual({
        error: 'test',
        errorCode: undefined,
        errorName: 'Error',
        errorStack: expect.any(String),
      });
    });

    it('should format error with code as name, code, and stack properties', () => {
      const data = {
        error: new ErrorWithCode('test', 42),
      };

      const result = formatLogData(data);

      expect(result).toEqual({
        error: 'test',
        errorCode: 42,
        errorName: 'ErrorWithCode',
        errorStack: expect.any(String),
      });
    });

    it('should format set as an array', () => {
      const data = {
        set: new Set(['A', 'B', 'C']),
      };

      // Note that the Set is not serialized as JSON.
      expect(JSON.stringify(data)).toEqual('{"set":{}}');

      const result = formatLogData(data);

      // The Set is now serialized.
      expect(result).toEqual({
        set: ['A', 'B', 'C'],
      });
    });

    it('should format map as an object', () => {
      const date = new Date();

      const data = {
        map: new Map<string, any>([
          ['A', 1],
          ['B', date],
          ['C', { foo: 'bar' }],
        ]),
      };

      // Note that the Map is not serialized as JSON.
      expect(JSON.stringify(data)).toEqual('{"map":{}}');

      const result = formatLogData(data);

      // The Map is now serialized.
      expect(result).toEqual({
        map: {
          A: 1,
          B: date.toJSON(),
          C: { foo: 'bar' },
        },
      });
    });

    it('should mask sensitive values', () => {
      const data = {
        password: 'secret',
        apiKey: 'secret',
      };

      const result = formatLogData(data);

      expect(result).toEqual({
        password: '***REDACTED***',
        apiKey: '***REDACTED***',
      });
    });
  });
});
