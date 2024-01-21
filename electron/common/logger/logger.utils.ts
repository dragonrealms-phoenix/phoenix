// Only import types from electron-log because the actual logger
// to use depends on if the code runs in the main or renderer process.
// It's in those modules that the correct logger instance will be imported.
import type {
  LogFunctions as ElectronLogFunctions,
  LogLevel as ElectronLogLevel,
  LogMessage as ElectronLogMessage,
  Logger as ElectronLogger,
} from 'electron-log';
import { includesIgnoreCase } from '../string';
import { formatLogData } from './logger.format';
import type { LogFunction, Logger } from './logger.types';
import { LogLevel } from './logger.types';

interface ElectronLogFunctionsExtended extends ElectronLogFunctions {
  /**
   * Alias for electron logger's 'silly' level.
   */
  trace: LogFunction;
}

/**
 * Get the electron-log instance to use, appropriate for
 * the current process (e.g. main vs. renderer).
 */
function getElectronLoggerInstance(): ElectronLogger {
  if (typeof window === 'undefined') {
    return require('electron-log/main');
  }
  return require('electron-log/renderer');
}

function addTraceLevel(logger: ElectronLogger): void {
  if (!includesIgnoreCase(logger.levels, LogLevel.TRACE)) {
    logger.addLevel(LogLevel.TRACE);
  }
}

export function createLogger(scope?: string): Logger {
  const electronLogger = getElectronLoggerInstance();

  addTraceLevel(electronLogger);

  const logger: ElectronLogFunctions = scope
    ? electronLogger.scope(scope)
    : electronLogger;

  // Have to cast because typescript isn't aware of the new `trace` function.
  const extendedLogger = logger as ElectronLogFunctionsExtended as Logger;

  extendedLogger.trace('created logger', { scope });

  return extendedLogger;
}

export function initializeLogging(logger: ElectronLogger): void {
  // Add our custom log formatter.
  logger.hooks.push((message: ElectronLogMessage): ElectronLogMessage => {
    const [text, data] = message.data as Parameters<LogFunction>;
    if (data) {
      message.data = [text, formatLogData(data)];
    }
    return message;
  });

  // Set the log level.
  Object.keys(logger.transports).forEach((transportKey) => {
    const transport = logger.transports[transportKey];
    if (transport) {
      transport.level = getLogLevel() as ElectronLogLevel;
    }
  });
}

export function isLogLevelEnabled(logLevelToCheck: LogLevel): boolean {
  const allLogLevels = Object.values(LogLevel);
  const currentIndex = allLogLevels.indexOf(getLogLevel());
  const indexToCheck = allLogLevels.indexOf(logLevelToCheck);

  // If neither log level is found then the log level is not enabled.
  if (currentIndex < 0 || indexToCheck < 0) {
    return false;
  }

  return currentIndex >= indexToCheck;
}

export function getLogLevel(): LogLevel {
  // eslint-disable-next-line no-restricted-globals -- process.env is allowed
  return (process.env.LOG_LEVEL ?? 'info') as LogLevel;
}
