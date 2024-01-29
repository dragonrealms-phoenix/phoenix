// Only import types from electron-log because the actual logger
// to use depends on if the code runs in the main or renderer process.
// It's in those modules that the correct logger instance will be imported.
import type {
  LogFunctions as ElectronLogFunctions,
  Logger as ElectronLogger,
} from 'electron-log';
import { includesIgnoreCase } from '../string/includes-ignore-case.js';
import type { LogFunction, Logger } from './types.js';
import { LogLevel } from './types.js';

// Cache loggers for the same scope.
const scopedLoggers: Record<string, ElectronLogFunctions> = {};

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
const getElectronLoggerInstance = async (): Promise<ElectronLogger> => {
  if (typeof window === 'undefined') {
    return import('electron-log/main.js');
  }
  return import('electron-log/renderer.js');
};

const addTraceLevel = (logger: ElectronLogger): void => {
  if (!includesIgnoreCase(logger.levels, LogLevel.TRACE)) {
    logger.addLevel(LogLevel.TRACE);
  }
};

export const createLogger = async (scope?: string): Promise<Logger> => {
  const electronLogger = await getElectronLoggerInstance();

  addTraceLevel(electronLogger);

  scope = scope ?? '';
  if (!scopedLoggers[scope]) {
    if (scope.length > 0) {
      scopedLoggers[scope] = electronLogger.scope(scope);
    } else {
      scopedLoggers[scope] = electronLogger;
    }
  }

  // Have to cast because typescript isn't aware of the new `trace` function.
  const logger = scopedLoggers[scope] as ElectronLogFunctionsExtended;

  logger.trace('created logger', { scope });

  return logger;
};
