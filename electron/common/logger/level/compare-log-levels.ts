import { LogLevel } from '../types.js';

/**
 * Returns a number indicating the relative order of the two log levels.
 * If the return value is less than 0, then lhs is less than rhs.
 * If the return value is greater than 0, then lhs is greater than rhs.
 * If the return value is 0, then lhs is equal to rhs.
 *
 * Example:
 * `compareLogLevels(LogLevel.ERROR, LogLevel.INFO)` returns 2, which means
 * that the error log level is two levels higher than the info log level.
 */
export const compareLogLevels = (lhs: LogLevel, rhs: LogLevel): number => {
  const allLogLevels = Object.values(LogLevel);
  const lhsIndex = allLogLevels.indexOf(lhs);
  const rhsIndex = allLogLevels.indexOf(rhs);

  // If neither log level is found then unable to compare.
  if (lhsIndex < 0 || rhsIndex < 0) {
    return NaN;
  }

  return rhsIndex - lhsIndex;
};
