import camelCase from 'lodash-es/camelCase.js';
import get from 'lodash-es/get.js';
import type { LogData } from '../types.js';

/**
 * Formats the log data such that values of non-serializable objects
 * are represented instead of being logged as "{}", as is the case
 * with Error, Map, and Set classes.
 *
 * This method mutates and returns the log data argument.
 */
export const formatLogData = (data: LogData): LogData => {
  // Non-serializable objects must be formatted as strings explicitly.
  // For example, this mitigates error objects being logged as "{}".
  for (const entry of Object.entries(data)) {
    const [key, value] = entry;
    if (value instanceof Error) {
      formatError(data, key, value);
    } else if (value instanceof Set) {
      formatSet(data, key, value);
    } else if (value instanceof Map) {
      formatMap(data, key, value);
    }
  }

  return data;
};

const formatError = (data: LogData, key: string, error: Error): void => {
  // Instead of { "error": errorObj } serializing to {}
  // we now get { "error": "it broke", "errorCode": 42, ... }
  data[key] = error.message;
  ['name', 'code', 'stack'].forEach((errProp) => {
    const errValue = get(error, errProp);
    if (errValue) {
      errProp = camelCase(`${key}_${errProp}`);
      data[errProp] = errValue;
    }
  });
};

const formatSet = (data: LogData, key: string, set: Set<any>): void => {
  // data[key] = Array.from(set.keys());
  data[key] = Array.from(set.values()).map((value) => {
    return formatSingleValue(value);
  });
};

const formatMap = (data: LogData, key: string, map: Map<any, any>): void => {
  data[key] = Array.from(map.entries()).reduce(
    (map, [key, value]) => {
      map[key] = formatSingleValue(value);
      return map;
    },
    {} as Record<string, unknown>
  );
};

const formatSingleValue = (value: any): any => {
  if (value instanceof Date) {
    return value.toJSON();
  }

  if (value === null || value === undefined || typeof value !== 'object') {
    return value;
  }

  return formatLogData(value);
};
