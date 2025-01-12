import { beforeEach, describe, expect, it } from 'vitest';
import type { LogMessage } from '../../../../common/logger/types.js';
import { LogLevel } from '../../../../common/logger/types.js';
import type { LogFormatter } from '../../types.js';
import { JsonLogFormatterImpl } from '../json.formatter.js';

describe('json-formatter', () => {
  const logDate = new Date('2022-01-02T00:00:00Z');

  describe('#format -- without colors', () => {
    let formatter: LogFormatter;

    beforeEach(() => {
      formatter = new JsonLogFormatterImpl({ useColors: false });
    });

    it('formats log message', () => {
      const message: LogMessage = {
        level: LogLevel.INFO,
        scope: 'test',
        message: 'hello world',
        timestamp: logDate,
      };

      const result = formatter.format(message);

      expect(result).toEqual(
        `{ level: 'info', scope: 'test', message: 'hello world', timestamp: ${logDate.toISOString()} }\n`
      );
    });

    it('formats log message with custom properties', () => {
      const message: LogMessage = {
        level: LogLevel.INFO,
        scope: 'test',
        message: 'hello world',
        timestamp: logDate,
        // Custom properties
        foo: 'bar',
      };

      const result = formatter.format(message);

      expect(result).toEqual(
        `{ level: 'info', scope: 'test', message: 'hello world', timestamp: ${logDate.toISOString()}, foo: 'bar' }\n`
      );
    });

    it('formats log message with complex properties', () => {
      const message: LogMessage = {
        level: LogLevel.INFO,
        scope: 'test',
        message: 'hello world',
        timestamp: logDate,
        // Custom properties
        boolean: false,
        number: 42,
        array: [1, 2, 3],
        date: logDate,
        set: new Set(['A', 'B', 'C']),
        map: new Map<string, any>([
          ['A', 1],
          ['B', logDate],
          ['C', { foo: 'bar' }],
        ]),
      };

      const result = formatter.format(message);

      expect(result).toEqual(
        `{ level: 'info', scope: 'test', message: 'hello world', timestamp: ${logDate.toISOString()}, boolean: false, number: 42, array: [ 1, 2, 3 ], date: ${logDate.toISOString()}, set: [ 'A', 'B', 'C' ], map: { A: 1, B: '${logDate.toISOString()}', C: { foo: 'bar' } } }\n`
      );
    });

    it('formats log message with sensitive properties', () => {
      const message: LogMessage = {
        level: LogLevel.INFO,
        scope: 'test',
        message: 'hello world',
        timestamp: logDate,
        // Custom properties
        password: 'secret',
        accessToken: 'secret',
        apiKey: 'secret',
      };

      const result = formatter.format(message);

      expect(result).toEqual(
        `{ level: 'info', scope: 'test', message: 'hello world', timestamp: ${logDate.toISOString()}, password: '***REDACTED***', accessToken: '***REDACTED***', apiKey: '***REDACTED***' }\n`
      );
    });
  });

  describe('#format -- with colors', () => {
    let formatter: LogFormatter;

    beforeEach(() => {
      formatter = new JsonLogFormatterImpl({ useColors: true });
    });

    it('formats error log message', () => {
      const message: LogMessage = {
        level: LogLevel.ERROR,
        scope: 'test',
        message: 'hello world',
        timestamp: logDate,
      };

      const result = formatter.format(message);

      expect(result).toEqual(
        `{ level: \u001b[32m'error'\u001b[39m, scope: \u001b[32m'test'\u001b[39m, message: \u001b[32m'hello world'\u001b[39m, timestamp: \u001b[35m2022-01-02T00:00:00.000Z\u001b[39m }\n`
      );
    });

    it('formats warn log message', () => {
      const message: LogMessage = {
        level: LogLevel.WARN,
        scope: 'test',
        message: 'hello world',
        timestamp: logDate,
      };

      const result = formatter.format(message);

      expect(result).toEqual(
        `{ level: \u001b[32m'warn'\u001b[39m, scope: \u001b[32m'test'\u001b[39m, message: \u001b[32m'hello world'\u001b[39m, timestamp: \u001b[35m2022-01-02T00:00:00.000Z\u001b[39m }\n`
      );
    });

    it('formats info log message', () => {
      const message: LogMessage = {
        level: LogLevel.INFO,
        scope: 'test',
        message: 'hello world',
        timestamp: logDate,
      };

      const result = formatter.format(message);

      expect(result).toEqual(
        `{ level: \u001b[32m'info'\u001b[39m, scope: \u001b[32m'test'\u001b[39m, message: \u001b[32m'hello world'\u001b[39m, timestamp: \u001b[35m2022-01-02T00:00:00.000Z\u001b[39m }\n`
      );
    });

    it('formats debug log message', () => {
      const message: LogMessage = {
        level: LogLevel.DEBUG,
        scope: 'test',
        message: 'hello world',
        timestamp: logDate,
      };

      const result = formatter.format(message);

      expect(result).toEqual(
        `{ level: \u001b[32m'debug'\u001b[39m, scope: \u001b[32m'test'\u001b[39m, message: \u001b[32m'hello world'\u001b[39m, timestamp: \u001b[35m2022-01-02T00:00:00.000Z\u001b[39m }\n`
      );
    });

    it('formats trace log message', () => {
      const message: LogMessage = {
        level: LogLevel.TRACE,
        scope: 'test',
        message: 'hello world',
        timestamp: logDate,
      };

      const result = formatter.format(message);

      expect(result).toEqual(
        `{ level: \u001b[32m'trace'\u001b[39m, scope: \u001b[32m'test'\u001b[39m, message: \u001b[32m'hello world'\u001b[39m, timestamp: \u001b[35m2022-01-02T00:00:00.000Z\u001b[39m }\n`
      );
    });
  });
});
