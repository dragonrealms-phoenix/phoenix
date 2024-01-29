import type { Maybe } from '../types.js';
import { equalsIgnoreCase } from './equals-ignore-case.js';

export const includesIgnoreCase = (
  values: Array<string>,
  valueToFind: Maybe<string>
): boolean => {
  return values.some((value) => equalsIgnoreCase(value, valueToFind));
};
