// Only import types from electron-log because the actual logger
// to use depends on if the code runs in the main or renderer process.
// It's in those modules that the correct logger instance will be imported.
import type { Logger as ElectronLogger, LogMessage } from 'electron-log';
import { camelCase, get } from 'lodash';
import type { LogData, LogFunction, Logger } from './logger.types';

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

  // Overwrite the console.log/warn/etc methods
  //Object.assign(console, logger.functions);
}

/**
 * Formats the log data such that values of non-serializable objects
 * are represented instead of being logged as "{}", as is the case
 * with Error, Map, and Set classes.
 *
 * This method mutates and returns the log data argument.
 */
export function formatLogData(data: LogData): LogData {
  // Non-serializable objects must be formatted as strings explicitly.
  // For example, this mitigates error objects being logged as "{}".
  for (const entry of Object.entries(data)) {
    const [key, value] = entry;
    if (value instanceof Error) {
      // Instead of { "error": errorObj } serializing to {}
      // we now get { "error": "it broke", "errorCode": 42, ... }
      data[key] = value.message;
      ['name', 'code', 'stack'].forEach((errProp) => {
        const errValue = get(value, errProp);
        if (errValue) {
          errProp = camelCase(`${key}_${errProp}`);
          data[errProp] = errValue;
        }
      });
    } else if (value instanceof Set) {
      data[key] = Array.from(value.keys());
    } else if (value instanceof Map) {
      data[key] = Array.from(value.entries());
    }
  }

  return data;
}
