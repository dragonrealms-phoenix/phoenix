import { snakeCase } from 'lodash';
import type { Maybe } from '../types';

export const includesIgnoreCase = (
  values: Array<string>,
  valueToFind: string
): boolean => {
  return values.some((value) => equalsIgnoreCase(value, valueToFind));
};

export const equalsIgnoreCase = (
  a: Maybe<string>,
  b: Maybe<string>
): boolean => {
  return a?.toLowerCase() === b?.toLowerCase();
};

export const toUpperSnakeCase = (value: string): string => {
  return snakeCase(value).toUpperCase();
};
