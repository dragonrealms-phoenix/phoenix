import { includesIgnoreCase } from '../../string/includes-ignore-case.js';
import type { LogData } from '../types.js';

/**
 * Although we make an effort to not log sensitive data, it's possible
 * we may accidentally log something we shouldn't. This method attempts
 * to mask any sensitive data that may have been logged.
 */
export const maskLogData = (data: LogData): LogData => {
  return maskSensitiveValues({ object: data });
};

/**
 * Replaces specified keys in an object with a mask value.
 * For example, to replace sensitive values with "***REDACTED***".
 */
export const maskSensitiveValues = (options: {
  /**
   * The object to sanitize.
   */
  object: any;
  /**
   * List of keys to replace with a mask.
   * Default is ["password", "accessToken", "apiKey"]
   */
  keys?: Array<string>;
  /**
   * The value to replace the matched keys with.
   * Default is "***REDACTED***".
   */
  mask?: string;
}): any => {
  const {
    object,
    keys = ['password', 'accessToken', 'apiKey'],
    mask = '***REDACTED***',
  } = options;

  if (isNotMaskable(object)) {
    return object;
  }

  const masked = { ...object };

  Object.keys(masked).forEach((key) => {
    const value = masked[key];
    if (includesIgnoreCase(keys, key)) {
      masked[key] = mask;
    } else if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        masked[key] = value.map((item) =>
          maskSensitiveValues({ object: item, keys, mask })
        );
      } else {
        masked[key] = maskSensitiveValues({ object: value, keys, mask });
      }
    }
  });

  return masked;
};

export const isNotMaskable = (value: any): boolean => {
  const typeofValue = typeof value;
  return (
    value === null ||
    value === undefined ||
    value instanceof Date ||
    typeofValue !== 'object'
  );
};
