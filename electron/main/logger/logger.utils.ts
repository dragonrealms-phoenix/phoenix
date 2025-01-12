import { LogLevel } from '../../common/logger/types.js';

// For performance reasons since the `LOG_LEVEL` env variable is
// not meant to be volatile during runtime, we cache computed values.

// It's a trade-off to make logging as fast as possible.
interface LogLevelCache {
  logLevel?: LogLevel;
  levels: Record<
    LogLevel,
    {
      enabled?: boolean;
    }
  >;
}

const newLogLevelCache = (): LogLevelCache => {
  return {
    levels: {
      [LogLevel.ERROR]: {},
      [LogLevel.WARN]: {},
      [LogLevel.INFO]: {},
      [LogLevel.DEBUG]: {},
      [LogLevel.TRACE]: {},
    },
  };
};

let logLevelCache = newLogLevelCache();

/**
 * Exposed literally so that I can clear it in tests.
 * Otherwise, there is no reason to call this method.
 */
export const clearLogLevelCache = (): void => {
  logLevelCache = newLogLevelCache();
};

/**
 * Gets and caches the log level from the environment variable LOG_LEVEL.
 * To skip the cache, use {@link computeLogLevel}.
 */
export const getLogLevel = (): LogLevel => {
  if (logLevelCache.logLevel === undefined) {
    logLevelCache.logLevel = computeLogLevel();
  }
  return logLevelCache.logLevel;
};

/**
 * Computes the log level from the environment variable LOG_LEVEL.
 * Default is LogLevel.INFO.
 * Does not cache the return value.
 */
export const computeLogLevel = (): LogLevel => {
  const LogLevelMap: Partial<Record<string, LogLevel>> = {
    error: LogLevel.ERROR,
    warn: LogLevel.WARN,
    info: LogLevel.INFO,
    debug: LogLevel.DEBUG,
    trace: LogLevel.TRACE,
  };
  const levelStr = process.env.LOG_LEVEL?.toLowerCase();
  return LogLevelMap[levelStr || LogLevel.INFO] ?? LogLevel.INFO;
};

/**
 * Gets and caches whether the given log level is enabled.
 * To skip the cache, use {@link computeIsLogLevelEnabled}.
 */
export const isLogLevelEnabled = (logLevelToCheck: LogLevel): boolean => {
  if (logLevelCache.levels[logLevelToCheck].enabled === undefined) {
    const isEnabled = computeIsLogLevelEnabled(logLevelToCheck);
    logLevelCache.levels[logLevelToCheck].enabled = isEnabled;
  }
  return logLevelCache.levels[logLevelToCheck].enabled;
};

/**
 * Computes whether the given log level is enabled.
 * Does not cache the return value.
 *
 * For example, if the log level were set to 'info', then
 * log levels 'error', 'warn', and 'info' would be enabled, but
 * log levels 'debug' and 'trace' would not.
 */
export const computeIsLogLevelEnabled = (logLevel: LogLevel): boolean => {
  const result = compareLogLevels(getLogLevel(), logLevel);

  if (isNaN(result)) {
    return false;
  }

  return result <= 0;
};

/**
 * Returns a number indicating the relative order of the two log levels.
 * If the return value is less than 0, then lhs is more restrictive than rhs.
 * If the return value is greater than 0, then lhs is less restrictive than rhs.
 * If the return value is 0, then lhs is equal to rhs.
 *
 * Example:
 * `compareLogLevels(LogLevel.ERROR, LogLevel.INFO)` returns 2, which means
 * that the error log level is two levels more restrictive than info.
 */
export const compareLogLevels = (lhs: LogLevel, rhs: LogLevel): number => {
  const LogLevelOrder: Record<LogLevel, number> = {
    [LogLevel.ERROR]: 0,
    [LogLevel.WARN]: 1,
    [LogLevel.INFO]: 2,
    [LogLevel.DEBUG]: 3,
    [LogLevel.TRACE]: 4,
  };

  const lhsIndex = LogLevelOrder[lhs];
  const rhsIndex = LogLevelOrder[rhs];

  // If neither log level is found then unable to compare.
  if (lhsIndex === undefined || rhsIndex === undefined) {
    return NaN;
  }

  return rhsIndex - lhsIndex;
};
