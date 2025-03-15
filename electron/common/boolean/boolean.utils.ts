import isNil from 'lodash-es/isNil.js';

// Note, we cannot simply convert a string literal to a boolean
// using Boolean constructor because it treats any non-blank value as truthy.
// Therefore, we explicitly check for values we consider truthy.
const BOOLEAN_STRINGS: Record<string, boolean> = {
  // truthy
  'true': true,
  'enabled': true,
  'on': true,
  'yes': true,
  '1': true,
  // falsey
  'false': false,
  'disabled': false,
  'off': false,
  'no': false,
  '0': false,
};

// Signature 1
export function toBoolean(
  value: string | number | boolean | null | undefined,
  defaultValue: boolean
): boolean;

// Signature 2
export function toBoolean(
  value: string | number | boolean | null | undefined,
  defaultValue?: boolean
): boolean | undefined;

// Implementation
export function toBoolean(
  value: string | number | boolean | null | undefined,
  defaultValue?: boolean
): boolean | undefined {
  if (isNil(value)) {
    return defaultValue;
  }
  const lower = String(value).toLowerCase();
  return BOOLEAN_STRINGS[lower] ?? defaultValue;
}
