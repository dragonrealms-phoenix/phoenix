import type {
  LogLevel as ElectronLogLevel,
  LogMessage as ElectronLogMessage,
  Logger as ElectronLogger,
} from 'electron-log';
import { includesIgnoreCase } from '../string/includes-ignore-case.js';
import { formatLogData } from './format-log-data.js';
import { getLogLevel } from './get-log-level.js';
import type { LogFunction } from './types.js';
import { LogLevel } from './types.js';

interface InitializableElectronLogger extends ElectronLogger {
  /**
   * Track if we have already initialized this logger instance
   * so that we don't duplicate our customizations.
   *
   * Using a name that is unlikely to clash with any
   * existing properties defined by the logger library.
   */
  __phoenix_initialized?: boolean;
}

export const initializeLogging = (
  logger: InitializableElectronLogger
): void => {
  if (isInitialized(logger)) {
    return;
  }

  // Add our custom log formatter.
  logger.hooks.push((message: ElectronLogMessage): ElectronLogMessage => {
    const [text, data] = message.data as Parameters<LogFunction>;
    if (data) {
      message.data = [text, formatLogData(data)];
    }
    return message;
  });

  // Add the trace log level option.
  if (!includesIgnoreCase(logger.levels, LogLevel.TRACE)) {
    logger.addLevel(LogLevel.TRACE);
  }

  // Set the log level for each transport.
  const logLevel = getLogLevel() as ElectronLogLevel;
  Object.keys(logger.transports).forEach((transportKey) => {
    const transport = logger.transports[transportKey];
    if (transport) {
      transport.level = logLevel;
    }
  });

  markInitialized(logger);
};

const isInitialized = (logger: InitializableElectronLogger): boolean => {
  return logger.__phoenix_initialized === true;
};

const markInitialized = (logger: InitializableElectronLogger): void => {
  logger.__phoenix_initialized = true;
};
