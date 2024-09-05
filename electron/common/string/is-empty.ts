/**
 * Returns true if the text is undefined, null, or empty string ('').
 * Whitespace characters are considered non-empty.
 *
 * We use a type guard in result to hint that if this function returns false
 * then the value cannot be null or undefined.
 */
export const isEmpty = (
  text: string | null | undefined
): text is null | undefined => {
  return !text || text === '';
};
