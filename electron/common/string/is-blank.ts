import { isEmpty } from './is-empty.js';

/**
 * Returns true if the text is undefined, null, or is empty when trimmed.
 * Whitespace characters are ignored.
 *
 * We use a type guard in result to hint that if this function returns false
 * then the value cannot be null or undefined.
 */
export const isBlank = (
  text: string | null | undefined
): text is null | undefined => {
  return isEmpty(text?.trim());
};
