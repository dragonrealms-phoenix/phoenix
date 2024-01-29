import { describe, expect, it } from 'vitest';
import { isLogLevelEnabled } from '../is-log-level-enabled.js';
import { LogLevel } from '../types.js';

describe('is-log-level-enabled', () => {
  it('detects available log levels when set to ERROR', () => {
    process.env.LOG_LEVEL = 'error';

    expect(isLogLevelEnabled(LogLevel.ERROR)).toBe(true);
    expect(isLogLevelEnabled(LogLevel.WARN)).toBe(false);
    expect(isLogLevelEnabled(LogLevel.INFO)).toBe(false);
    expect(isLogLevelEnabled(LogLevel.DEBUG)).toBe(false);
    expect(isLogLevelEnabled(LogLevel.TRACE)).toBe(false);
  });

  it('detects available log levels when set to WARN', () => {
    process.env.LOG_LEVEL = 'warn';

    expect(isLogLevelEnabled(LogLevel.ERROR)).toBe(true);
    expect(isLogLevelEnabled(LogLevel.WARN)).toBe(true);
    expect(isLogLevelEnabled(LogLevel.INFO)).toBe(false);
    expect(isLogLevelEnabled(LogLevel.DEBUG)).toBe(false);
    expect(isLogLevelEnabled(LogLevel.TRACE)).toBe(false);
  });

  it('detects available log levels when set to INFO', () => {
    process.env.LOG_LEVEL = 'info';

    expect(isLogLevelEnabled(LogLevel.ERROR)).toBe(true);
    expect(isLogLevelEnabled(LogLevel.WARN)).toBe(true);
    expect(isLogLevelEnabled(LogLevel.INFO)).toBe(true);
    expect(isLogLevelEnabled(LogLevel.DEBUG)).toBe(false);
    expect(isLogLevelEnabled(LogLevel.TRACE)).toBe(false);
  });

  it('detects available log levels when set to DEBUG', () => {
    process.env.LOG_LEVEL = 'debug';

    expect(isLogLevelEnabled(LogLevel.ERROR)).toBe(true);
    expect(isLogLevelEnabled(LogLevel.WARN)).toBe(true);
    expect(isLogLevelEnabled(LogLevel.INFO)).toBe(true);
    expect(isLogLevelEnabled(LogLevel.DEBUG)).toBe(true);
    expect(isLogLevelEnabled(LogLevel.TRACE)).toBe(false);
  });

  it('detects available log levels when set to TRACE', () => {
    process.env.LOG_LEVEL = 'trace';

    expect(isLogLevelEnabled(LogLevel.ERROR)).toBe(true);
    expect(isLogLevelEnabled(LogLevel.WARN)).toBe(true);
    expect(isLogLevelEnabled(LogLevel.INFO)).toBe(true);
    expect(isLogLevelEnabled(LogLevel.DEBUG)).toBe(true);
    expect(isLogLevelEnabled(LogLevel.TRACE)).toBe(true);
  });
});
