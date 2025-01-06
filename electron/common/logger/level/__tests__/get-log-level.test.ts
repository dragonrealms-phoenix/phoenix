import { afterEach, describe, expect, it, vi } from 'vitest';
import { LogLevel } from '../../types.js';
import { getLogLevel } from '../get-log-level.js';

describe('get-log-level', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('gets the log level from the environment', () => {
    vi.stubEnv('LOG_LEVEL', 'error');

    expect(getLogLevel()).toBe(LogLevel.ERROR);
  });

  it('defaults to INFO if no log level is set', () => {
    vi.stubEnv('LOG_LEVEL', '');

    expect(getLogLevel()).toBe(LogLevel.INFO);
  });
});
