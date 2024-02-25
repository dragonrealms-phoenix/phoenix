import { afterEach, describe, expect, it, vi } from 'vitest';
import { isLogLevelEnabled } from '../is-log-level-enabled.js';
import { LogLevel } from '../types.js';

describe('is-log-level-enabled', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('detects available log levels when set to ERROR', () => {
    vi.stubEnv('LOG_LEVEL', 'error');

    expect(isLogLevelEnabled(LogLevel.ERROR)).toBe(true);
    expect(isLogLevelEnabled(LogLevel.WARN)).toBe(false);
    expect(isLogLevelEnabled(LogLevel.INFO)).toBe(false);
    expect(isLogLevelEnabled(LogLevel.DEBUG)).toBe(false);
    expect(isLogLevelEnabled(LogLevel.TRACE)).toBe(false);
  });

  it('detects available log levels when set to WARN', () => {
    vi.stubEnv('LOG_LEVEL', 'warn');

    expect(isLogLevelEnabled(LogLevel.ERROR)).toBe(true);
    expect(isLogLevelEnabled(LogLevel.WARN)).toBe(true);
    expect(isLogLevelEnabled(LogLevel.INFO)).toBe(false);
    expect(isLogLevelEnabled(LogLevel.DEBUG)).toBe(false);
    expect(isLogLevelEnabled(LogLevel.TRACE)).toBe(false);
  });

  it('detects available log levels when set to INFO', () => {
    vi.stubEnv('LOG_LEVEL', 'info');

    expect(isLogLevelEnabled(LogLevel.ERROR)).toBe(true);
    expect(isLogLevelEnabled(LogLevel.WARN)).toBe(true);
    expect(isLogLevelEnabled(LogLevel.INFO)).toBe(true);
    expect(isLogLevelEnabled(LogLevel.DEBUG)).toBe(false);
    expect(isLogLevelEnabled(LogLevel.TRACE)).toBe(false);
  });

  it('detects available log levels when set to DEBUG', () => {
    vi.stubEnv('LOG_LEVEL', 'debug');

    expect(isLogLevelEnabled(LogLevel.ERROR)).toBe(true);
    expect(isLogLevelEnabled(LogLevel.WARN)).toBe(true);
    expect(isLogLevelEnabled(LogLevel.INFO)).toBe(true);
    expect(isLogLevelEnabled(LogLevel.DEBUG)).toBe(true);
    expect(isLogLevelEnabled(LogLevel.TRACE)).toBe(false);
  });

  it('detects available log levels when set to TRACE', () => {
    vi.stubEnv('LOG_LEVEL', 'trace');

    expect(isLogLevelEnabled(LogLevel.ERROR)).toBe(true);
    expect(isLogLevelEnabled(LogLevel.WARN)).toBe(true);
    expect(isLogLevelEnabled(LogLevel.INFO)).toBe(true);
    expect(isLogLevelEnabled(LogLevel.DEBUG)).toBe(true);
    expect(isLogLevelEnabled(LogLevel.TRACE)).toBe(true);
  });

  it('detects available log levels when set to UNKNOWN', () => {
    vi.stubEnv('LOG_LEVEL', 'unknown'); // or any unexpected value

    expect(isLogLevelEnabled(LogLevel.ERROR)).toBe(false);
    expect(isLogLevelEnabled(LogLevel.WARN)).toBe(false);
    expect(isLogLevelEnabled(LogLevel.INFO)).toBe(false);
    expect(isLogLevelEnabled(LogLevel.DEBUG)).toBe(false);
    expect(isLogLevelEnabled(LogLevel.TRACE)).toBe(false);
  });
});
