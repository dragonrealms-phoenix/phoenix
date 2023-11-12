// Only import types from electron-log because the actual logger
// to use depends on if the code runs in the main or renderer process.
// It's in those modules that the correct logger instance will be imported.
import type {
  Logger as ElectronLogger,
  LogLevel,
  LogMessage,
} from 'electron-log';
import { camelCase, get } from 'lodash';
import { includesIgnoreCase } from '../string/string.utils';
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

  data = maskSensitiveValues({ json: data });

  return data;
}

/**
 * Although we make an effort to not log sensitive data, it's possible
 * we may accidentally log something we shouldn't. This method attempts
 * to mask any sensitive data that may have been logged.
 */
function maskSensitiveValues(options: {
  /**
   * The JSON object to sanitize.
   */
  json: any;
  /**
   * List of keys to replace with a mask.
   * Default is ["password", "key"]
   */
  keys?: Array<string>;
  /**
   * The value to replace the matched keys with.
   * Default is "[REDACTED]".
   */
  mask?: string;
}): any {
  const { json, keys = ['password', 'key'], mask = '[REDACTED]' } = options;

  if (isNotMaskable(json)) {
    return json;
  }

  const masked = { ...json };

  Object.keys(masked).forEach((key) => {
    const value = masked[key];
    if (includesIgnoreCase(keys, key)) {
      masked[key] = mask;
    } else if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        masked[key] = value.map((item) =>
          maskSensitiveValues({ json: item, keys, mask })
        );
      } else {
        masked[key] = maskSensitiveValues({ json: value, keys, mask });
      }
    }
  });

  return masked;
}

function isNotMaskable(value: any): boolean {
  const typeofValue = typeof value;
  return (
    value === null ||
    value === undefined ||
    value instanceof Date ||
    typeofValue !== 'object'
  );
}
