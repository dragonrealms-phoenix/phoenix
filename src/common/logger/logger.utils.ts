import electronLog, { LogMessage } from 'electron-log';
import { camelCase, get } from 'lodash';
import { isMainProcess } from '../process/process.utils';
import { LogData, LogFunction } from './logger.types';

export function initializeLogging(logger: electronLog.Logger): void {
  // Initialize the logger for any renderer processes. Must do from main.
  if (isMainProcess()) {
    electronLog.initialize({ preload: true });
  }

  // Add our custom log formatter.
  logger.hooks.push((message: LogMessage): LogMessage => {
    const [text, data] = message.data as Parameters<LogFunction>;
    message.data = [text, formatLogData(data)];
    return message;
  });

  // Catch and log unhandled exceptions, such as promise rejections.
  logger.errorHandler.startCatching();

  // Overwrite the console.log/warn/etc methods
  Object.assign(console, logger.functions);
}

/**
 * Formats the log data such that values of non-serializable objects
 * are represented instead of being logged as "{}", as is the case
 * with Error, Map, and Set classes.
 *
 * This method mutates and returns the data argument.
 */
export function formatLogData(data?: LogData): LogData {
  const logData = data ?? {};

  // Non-serializable objects must be formatted as strings explicitly.
  // For example, this mitigates error objects being logged as "{}".
  for (const entry of Object.entries(logData)) {
    const [key, value] = entry;
    if (value instanceof Error) {
      // Instead of { "error": errorObj } serializing to {}
      // we now get { "error": "it broke", "errorCode": 42, ... }
      logData[key] = value.message;
      ['name', 'code', 'stack'].forEach((errProp) => {
        const errValue = get(value, errProp);
        if (errValue) {
          errProp = camelCase(`${key}_${errProp}`);
          logData[errProp] = errValue;
        }
      });
    } else if (value instanceof Set) {
      logData[key] = Array.from(value.keys());
    } else if (value instanceof Map) {
      logData[key] = Array.from(value.entries());
    }
  }

  return logData;
}
