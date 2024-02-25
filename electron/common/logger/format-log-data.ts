import camelCase from 'lodash-es/camelCase.js';
import get from 'lodash-es/get.js';
import { maskSensitiveValues } from './mask-log-data.js';
import type { LogData } from './types.js';

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
      data[key] = Array.from(value.entries()).reduce(
        (map, [key, value]) => {
          if (value instanceof Date) {
            map[key] = value.toJSON();
          } else if (
            value === null ||
            value === undefined ||
            typeof value !== 'object'
          ) {
            map[key] = value;
          } else {
            map[key] = formatLogData(value);
          }
          return map;
        },
        {} as Record<string, unknown>
      );
    }
  }

  data = maskSensitiveValues({ json: data });

  return data;
}
