import { describe, expect, it } from 'vitest';
import { getLogLevel } from '../get-log-level.js';
import { LogLevel } from '../types.js';

describe('get-log-level', () => {
  it('gets the log level from the environment', () => {
    process.env.LOG_LEVEL = 'error';

    expect(getLogLevel()).toBe(LogLevel.ERROR);
  });

  it('defaults to INFO if no log level is set', () => {
    delete process.env.LOG_LEVEL;

    expect(getLogLevel()).toBe(LogLevel.INFO);
  });
});
