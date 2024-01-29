import { getLogLevel } from './get-log-level.js';
import { LogLevel } from './types.js';

export const isLogLevelEnabled = (logLevelToCheck: LogLevel): boolean => {
  const allLogLevels = Object.values(LogLevel);
  const currentIndex = allLogLevels.indexOf(getLogLevel());
  const indexToCheck = allLogLevels.indexOf(logLevelToCheck);

  // If neither log level is found then the log level is not enabled.
  if (currentIndex < 0 || indexToCheck < 0) {
    return false;
  }

  return currentIndex >= indexToCheck;
};
