import { snakeCase } from 'lodash';
import type { Maybe } from '../types';

export function includesIgnoreCase(
  values: Array<string>,
  valueToFind: string
): boolean {
  return values.some((value) => equalsIgnoreCase(value, valueToFind));
}

export function equalsIgnoreCase(a: Maybe<string>, b: Maybe<string>): boolean {
  return a?.toLowerCase() === b?.toLowerCase();
}

export function toUpperSnakeCase(value: string): string {
  return snakeCase(value).toUpperCase();
}
