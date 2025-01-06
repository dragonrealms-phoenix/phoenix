import moment from 'moment';
import { beforeEach, describe, expect, it } from 'vitest';
import type { LogFormatter, LogMessage } from '../../types.js';
import { LogLevel } from '../../types.js';
import { prettyLogFormatter } from '../pretty-log-formatter.js';

describe('pretty-log-formatter', () => {
  const logDate = new Date('2022-01-02T00:00:00Z');
  const logDateStr = moment(logDate).format('YYYY-MM-DD HH:mm:ss.SSSZ');

  let formatter: LogFormatter;

  beforeEach(() => {
    formatter = prettyLogFormatter({ colors: false });
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
      `[${logDateStr}] [INFO]   (test)               hello world ‣ {}\n`
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
      `[${logDateStr}] [INFO]   (test)               hello world ‣ { foo: 'bar' }\n`
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
      `[${logDateStr}] [INFO]   (test)               hello world ‣ { boolean: false,\n  number: 42,\n  array: [ 1, 2, 3 ],\n  date: ${logDate.toISOString()},\n  set: [ 'A', 'B', 'C' ],\n  map: { A: 1, B: '${logDate.toISOString()}', C: { foo: 'bar' } } }\n`
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
      `[${logDateStr}] [INFO]   (test)               hello world ‣ { password: '***REDACTED***',\n  accessToken: '***REDACTED***',\n  apiKey: '***REDACTED***' }\n`
    );
  });

  it('formats log messages with colors', () => {
    formatter = prettyLogFormatter({ colors: true });

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

    // Note, the pretty formatter colorizes the values based on criteria.
    // Each piece of data is colorized based on what it represents.
    // This behavior differs from the json formatter.

    expect(lines[0]).toEqual(
      `\u001b[90m[${logDateStr}]\u001b[39m \u001b[31m[ERROR] \u001b[39m \u001b[34m(test)              \u001b[39m \u001b[0mhello world\u001b[0m ‣ {}`
    );

    expect(lines[1]).toEqual(
      `\u001b[90m[${logDateStr}]\u001b[39m \u001b[33m[WARN]  \u001b[39m \u001b[34m(test)              \u001b[39m \u001b[0mhello world\u001b[0m ‣ {}`
    );

    expect(lines[2]).toEqual(
      `\u001b[90m[${logDateStr}]\u001b[39m \u001b[36m[INFO]  \u001b[39m \u001b[34m(test)              \u001b[39m \u001b[0mhello world\u001b[0m ‣ {}`
    );

    expect(lines[3]).toEqual(
      `\u001b[90m[${logDateStr}]\u001b[39m \u001b[0m[DEBUG] \u001b[0m \u001b[34m(test)              \u001b[39m \u001b[0mhello world\u001b[0m ‣ {}`
    );

    expect(lines[4]).toEqual(
      `\u001b[90m[${logDateStr}]\u001b[39m \u001b[0m[TRACE] \u001b[0m \u001b[34m(test)              \u001b[39m \u001b[0mhello world\u001b[0m ‣ {}`
    );
  });
});
