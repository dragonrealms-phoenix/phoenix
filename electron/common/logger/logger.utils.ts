// Only import types from electron-log because the actual logger
// to use depends on if the code runs in the main or renderer process.
// It's in those modules that the correct logger instance will be imported.
import type {
  LogFunctions as ElectronLogFunctions,
  Logger as ElectronLogger,
  LogLevel,
  LogMessage,
} from 'electron-log';
import { formatLogData } from './logger.format';
import type { LogFunction, Logger } from './logger.types';

interface ElectronLogFunctionsExtended extends ElectronLogFunctions {
  /**
   * Alias for silly.
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
  if (!logger.levels.includes('trace')) {
    logger.addLevel('trace');
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
  logger.hooks.push((message: LogMessage): LogMessage => {
    const [text, data] = message.data as Parameters<LogFunction>;
    if (data) {
      message.data = [text, formatLogData(data)];
    }
    return message;
  });

  // Set the log level.
  // eslint-disable-next-line no-restricted-globals -- process.env is allowed
  const logLevel = (process.env.LOG_LEVEL ?? 'info') as LogLevel;
  Object.keys(logger.transports).forEach((transportKey) => {
    const transport = logger.transports[transportKey];
    if (transport) {
      transport.level = logLevel;
    }
  });

  // Overwrite the console.log/warn/etc methods
  //Object.assign(console, logger.functions);
}
