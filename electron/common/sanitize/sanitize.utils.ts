import isPlainObject from 'lodash-es/isPlainObject.js';
import { includesIgnoreCase } from '../string/string.utils.js';

/**
 * Replaces specified keys in an object with a mask value.
 * For example, to replace sensitive values with "***REDACTED***".
 */
export const maskSensitiveValues = (options: {
  /**
   * The object to sanitize.
   */
  object: Record<string, any>;
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

  if (!isPlainObject(object)) {
    return object;
  }

  const masked = { ...object };

  Object.keys(masked).forEach((key) => {
    const value = masked[key];
    if (includesIgnoreCase(keys, key)) {
      masked[key] = mask;
    } else if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        masked[key] = value.map((item) => {
          return maskSensitiveValues({
            object: item,
            keys,
            mask,
          });
        });
      } else {
        masked[key] = maskSensitiveValues({
          object: value,
          keys,
          mask,
        });
      }
    }
  });

  return masked;
};
