// Only import types from electron-log because the actual logger
// to use depends on if the code runs in the main or renderer process.
// It's in those modules that the correct logger instance will be imported.
import type {
  Logger as ElectronLogger,
  LogLevel,
  LogMessage,
} from 'electron-log';
import { formatLogData } from './logger.format';
import type { LogFunction, Logger } from './logger.types';

export function createLogger(scope?: string): Logger {
  let electronLogger: ElectronLogger;
  if (typeof window === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    electronLogger = require('electron-log/main');
  } else {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    electronLogger = require('electron-log/renderer');
  }
  return scope ? electronLogger.scope(scope) : electronLogger;
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
