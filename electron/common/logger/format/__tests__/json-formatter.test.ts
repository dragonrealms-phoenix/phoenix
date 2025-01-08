import { beforeEach, describe, expect, it } from 'vitest';
import type { LogFormatter, LogMessage } from '../../types.js';
import { LogLevel } from '../../types.js';
import { jsonLogFormatterFactory } from '../json.formatter.js';

describe('json-formatter', () => {
  const logDate = new Date('2022-01-02T00:00:00Z');

  let formatter: LogFormatter;

  beforeEach(() => {
    formatter = jsonLogFormatterFactory({ colors: false });
  });

  it('formats log message', () => {
    const message: LogMessage = {
      level: LogLevel.INFO,
      scope: 'test',
      message: 'hello world',
      timestamp: logDate,
    };

    const result = formatter([message]);

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

    const result = formatter([message]);

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

    const result = formatter([message]);

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

    const result = formatter([message]);

    expect(result).toEqual(
      `{ level: 'info', scope: 'test', message: 'hello world', timestamp: ${logDate.toISOString()}, password: '***REDACTED***', accessToken: '***REDACTED***', apiKey: '***REDACTED***' }\n`
    );
  });

  it('formats log messages with colors', () => {
    formatter = jsonLogFormatterFactory({ colors: true });

    const messages: Array<LogMessage> = [
      {
        level: LogLevel.ERROR,
        scope: 'test',
        message: 'hello world',
        timestamp: logDate,
      },
      {
        level: LogLevel.WARN,
        scope: 'test',
        message: 'hello world',
        timestamp: logDate,
      },
      {
        level: LogLevel.INFO,
        scope: 'test',
        message: 'hello world',
        timestamp: logDate,
      },
      {
        level: LogLevel.DEBUG,
        scope: 'test',
        message: 'hello world',
        timestamp: logDate,
      },
      {
        level: LogLevel.TRACE,
        scope: 'test',
        message: 'hello world',
        timestamp: logDate,
      },
    ];

    const result = formatter(messages);
    const lines = result.trim().split('\n');

    expect(lines).toHaveLength(messages.length);

    // Note, the json formatter colorizes the values based on data type.
    // The log levels are strings and so all have the same color.
    // This behavior differs from the pretty formatter.

    expect(lines[0]).toEqual(
      `{ level: \u001b[32m'error'\u001b[39m, scope: \u001b[32m'test'\u001b[39m, message: \u001b[32m'hello world'\u001b[39m, timestamp: \u001b[35m2022-01-02T00:00:00.000Z\u001b[39m }`
    );

    expect(lines[1]).toEqual(
      `{ level: \u001b[32m'warn'\u001b[39m, scope: \u001b[32m'test'\u001b[39m, message: \u001b[32m'hello world'\u001b[39m, timestamp: \u001b[35m2022-01-02T00:00:00.000Z\u001b[39m }`
    );

    expect(lines[2]).toEqual(
      `{ level: \u001b[32m'info'\u001b[39m, scope: \u001b[32m'test'\u001b[39m, message: \u001b[32m'hello world'\u001b[39m, timestamp: \u001b[35m2022-01-02T00:00:00.000Z\u001b[39m }`
    );

    expect(lines[3]).toEqual(
      `{ level: \u001b[32m'debug'\u001b[39m, scope: \u001b[32m'test'\u001b[39m, message: \u001b[32m'hello world'\u001b[39m, timestamp: \u001b[35m2022-01-02T00:00:00.000Z\u001b[39m }`
    );

    expect(lines[4]).toEqual(
      `{ level: \u001b[32m'trace'\u001b[39m, scope: \u001b[32m'test'\u001b[39m, message: \u001b[32m'hello world'\u001b[39m, timestamp: \u001b[35m2022-01-02T00:00:00.000Z\u001b[39m }`
    );
  });
});
