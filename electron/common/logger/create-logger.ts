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

const addTraceLevel = (logger: ElectronLogger): void => {
  if (!includesIgnoreCase(logger.levels, LogLevel.TRACE)) {
    logger.addLevel(LogLevel.TRACE);
  }
};

export const createLogger = (options: {
  /**
   * Label printed with each log message to identify the source.
   * If provided, the scope must be unique throughout the application
   * because scoped loggers are cached and re-used.
   */
  scope?: string;
  /**
   * Underlying electron logger instance to use.
   * Defaults to the electron logger for the main process.
   *
   * The main package code SHOULD provide the main logger instance.
   * The renderer package code MUST provide the renderer logger instance.
   */
  logger: ElectronLogger;
}): Logger => {
  const scope = options?.scope ?? '';
  const electronLogger = options.logger;

  addTraceLevel(electronLogger);

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
