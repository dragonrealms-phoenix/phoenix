import { camelCase, get } from 'lodash';
import { maskSensitiveValues } from './logger.mask';
import type { LogData } from './logger.types';

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
