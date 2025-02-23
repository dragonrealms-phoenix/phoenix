import { afterEach, describe, expect, it, vi } from 'vitest';
import { LogLevel } from '../../../common/logger/types.js';
import {
  clearLogLevelCache,
  compareLogLevels,
  computeIsLogLevelEnabled,
  computeLogLevel,
  getLogLevel,
  isLogLevelEnabled,
} from '../logger.utils.js';

describe('logger-utils', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    clearLogLevelCache();
  });

  describe('#getLogLevel', () => {
    it('gets and caches the log level from the environment', () => {
      vi.stubEnv('LOG_LEVEL', 'error');

      expect(getLogLevel()).toBe(LogLevel.ERROR);

      // Value is now cached
      vi.unstubAllEnvs();

      expect(getLogLevel()).toBe(LogLevel.ERROR);
    });

    it('defaults to INFO if no log level is set', () => {
      vi.stubEnv('LOG_LEVEL', '');

      expect(getLogLevel()).toBe(LogLevel.INFO);
    });
  });

  describe('#computeLogLevel', () => {
    it('gets the log level from the environment', () => {
      vi.stubEnv('LOG_LEVEL', 'error');

      expect(computeLogLevel()).toBe(LogLevel.ERROR);

      vi.stubEnv('LOG_LEVEL', 'warn');

      expect(computeLogLevel()).toBe(LogLevel.WARN);

      vi.stubEnv('LOG_LEVEL', 'info');

      expect(computeLogLevel()).toBe(LogLevel.INFO);

      vi.stubEnv('LOG_LEVEL', 'debug');

      expect(computeLogLevel()).toBe(LogLevel.DEBUG);

      vi.stubEnv('LOG_LEVEL', 'trace');

      expect(computeLogLevel()).toBe(LogLevel.TRACE);
    });

    it('defaults to INFO if no log level is set', () => {
      vi.stubEnv('LOG_LEVEL', '');

      expect(computeLogLevel()).toBe(LogLevel.INFO);
    });
  });

  describe('#isLogLevelEnabled', () => {
    it('caches whether the given log level is enabled', () => {
      vi.stubEnv('LOG_LEVEL', 'error');

      expect(isLogLevelEnabled(LogLevel.ERROR)).toBe(true);

      // Value is now cached
      vi.unstubAllEnvs();

      expect(isLogLevelEnabled(LogLevel.ERROR)).toBe(true);
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

      // If log level is not a valid value, it defaults to INFO

      expect(isLogLevelEnabled(LogLevel.ERROR)).toBe(true);
      expect(isLogLevelEnabled(LogLevel.WARN)).toBe(true);
      expect(isLogLevelEnabled(LogLevel.INFO)).toBe(true);
      expect(isLogLevelEnabled(LogLevel.DEBUG)).toBe(false);
      expect(isLogLevelEnabled(LogLevel.TRACE)).toBe(false);
    });
  });

  describe('#computeIsLogLevelEnabled', () => {
    it('does not cache whether the given log level is enabled', () => {
      vi.stubEnv('LOG_LEVEL', 'debug');

      expect(computeIsLogLevelEnabled(LogLevel.ERROR)).toBe(true);
      expect(computeIsLogLevelEnabled(LogLevel.WARN)).toBe(true);
      expect(computeIsLogLevelEnabled(LogLevel.INFO)).toBe(true);
      expect(computeIsLogLevelEnabled(LogLevel.DEBUG)).toBe(true);
      expect(computeIsLogLevelEnabled(LogLevel.TRACE)).toBe(false);

      // Value is now cached
      vi.unstubAllEnvs();
      clearLogLevelCache();

      // If log level is not a valid value, it defaults to INFO

      expect(computeIsLogLevelEnabled(LogLevel.ERROR)).toBe(true);
      expect(computeIsLogLevelEnabled(LogLevel.WARN)).toBe(true);
      expect(computeIsLogLevelEnabled(LogLevel.INFO)).toBe(true);
      expect(computeIsLogLevelEnabled(LogLevel.DEBUG)).toBe(false);
      expect(computeIsLogLevelEnabled(LogLevel.TRACE)).toBe(false);
    });

    it('returns false if log levels are not found', () => {
      expect(computeIsLogLevelEnabled('foo' as LogLevel)).toBe(false);
    });
  });

  describe('#compareLogLevels', () => {
    it('compares log levels to ERROR', () => {
      expect(compareLogLevels(LogLevel.ERROR, LogLevel.ERROR)).toBe(0);
      expect(compareLogLevels(LogLevel.ERROR, LogLevel.WARN)).toBe(1);
      expect(compareLogLevels(LogLevel.ERROR, LogLevel.INFO)).toBe(2);
      expect(compareLogLevels(LogLevel.ERROR, LogLevel.DEBUG)).toBe(3);
      expect(compareLogLevels(LogLevel.ERROR, LogLevel.TRACE)).toBe(4);
    });

    it('compares log levels to WARN', () => {
      expect(compareLogLevels(LogLevel.WARN, LogLevel.ERROR)).toBe(-1);
      expect(compareLogLevels(LogLevel.WARN, LogLevel.WARN)).toBe(0);
      expect(compareLogLevels(LogLevel.WARN, LogLevel.INFO)).toBe(1);
      expect(compareLogLevels(LogLevel.WARN, LogLevel.DEBUG)).toBe(2);
      expect(compareLogLevels(LogLevel.WARN, LogLevel.TRACE)).toBe(3);
    });

    it('compares log levels to INFO', () => {
      expect(compareLogLevels(LogLevel.INFO, LogLevel.ERROR)).toBe(-2);
      expect(compareLogLevels(LogLevel.INFO, LogLevel.WARN)).toBe(-1);
      expect(compareLogLevels(LogLevel.INFO, LogLevel.INFO)).toBe(0);
      expect(compareLogLevels(LogLevel.INFO, LogLevel.DEBUG)).toBe(1);
      expect(compareLogLevels(LogLevel.INFO, LogLevel.TRACE)).toBe(2);
    });

    it('compares log levels to DEBUG', () => {
      expect(compareLogLevels(LogLevel.DEBUG, LogLevel.ERROR)).toBe(-3);
      expect(compareLogLevels(LogLevel.DEBUG, LogLevel.WARN)).toBe(-2);
      expect(compareLogLevels(LogLevel.DEBUG, LogLevel.INFO)).toBe(-1);
      expect(compareLogLevels(LogLevel.DEBUG, LogLevel.DEBUG)).toBe(0);
      expect(compareLogLevels(LogLevel.DEBUG, LogLevel.TRACE)).toBe(1);
    });

    it('compares log levels to TRACE', () => {
      expect(compareLogLevels(LogLevel.TRACE, LogLevel.ERROR)).toBe(-4);
      expect(compareLogLevels(LogLevel.TRACE, LogLevel.WARN)).toBe(-3);
      expect(compareLogLevels(LogLevel.TRACE, LogLevel.INFO)).toBe(-2);
      expect(compareLogLevels(LogLevel.TRACE, LogLevel.DEBUG)).toBe(-1);
      expect(compareLogLevels(LogLevel.TRACE, LogLevel.TRACE)).toBe(0);
    });

    it('returns NaN if log levels are not found', () => {
      expect(compareLogLevels('foo' as LogLevel, LogLevel.ERROR)).toBe(NaN);
      expect(compareLogLevels(LogLevel.ERROR, 'foo' as LogLevel)).toBe(NaN);
    });
  });
});
