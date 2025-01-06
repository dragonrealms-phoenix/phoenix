import type { LogLevel } from '../types.js';
import { compareLogLevels } from './compare-log-levels.js';
import { getLogLevel } from './get-log-level.js';

/**
 * Returns whether the given log level is enabled.
 *
 * For example, if the log level were set to 'info', then
 * log levels 'error', 'warn', and 'info' would be enabled, but
 * log levels 'debug' and 'trace' would not.
 */
export const isLogLevelEnabled = (logLevelToCheck: LogLevel): boolean => {
  const result = compareLogLevels(getLogLevel(), logLevelToCheck);

  if (isNaN(result)) {
    return false;
  }

  return result <= 0;
};
