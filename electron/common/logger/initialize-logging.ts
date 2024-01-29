import type {
  LogLevel as ElectronLogLevel,
  LogMessage as ElectronLogMessage,
  Logger as ElectronLogger,
} from 'electron-log';
import { formatLogData } from './format-log-data.js';
import { getLogLevel } from './get-log-level.js';
import type { LogFunction } from './types.js';

export const initializeLogging = (logger: ElectronLogger): void => {
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
};
