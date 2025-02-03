import snakeCase from 'lodash-es/snakeCase.js';
import startCase from 'lodash-es/startCase.js';
import type { Maybe } from '../types.js';

/**
 * Map of XML entities to their unescaped values.
 */
const UNESCAPABLE_ENTITIES: Record<string, string> = {
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  amp: '&',
};

const UNESCAPE_ENTITIES_REGEX = /&([a-zA-Z0-9]+);/g;

/**
 * Unescapes XML entities.
 * For example, converts '&lt;' to '<'.
 *
 * By default, unescapes the following entities:
 * - &lt;
 * - &gt;
 * - &quot;
 * - &apos;
 * - &amp;
 */
export const unescapeEntities = (
  text: string,
  options?: {
    /**
     * Specify your own entities to unescape.
     * The keys should be the entity name like 'lt' or 'gt'.
     * The values should be the unescaped value like '<' or '>'.
     */
    entities?: Record<string, string>;
  }
): string => {
  const { entities = UNESCAPABLE_ENTITIES } = options ?? {};

  // Replaces the matched text with the return value of the callback function.
  // The capturing group just helps us identify which entity to unescape.
  return text.replace(
    UNESCAPE_ENTITIES_REGEX,
    (matchedText, capturedText, _index, _allText) => {
      return entities[capturedText] ?? matchedText;
    }
  );
};

/**
 * Returns true if the two strings are equal, ignoring case.
 */
export const equalsIgnoreCase = (
  a: Maybe<string>,
  b: Maybe<string>
): boolean => {
  return a?.toLowerCase() === b?.toLowerCase();
};

/**
 * Like `Array.prototype.includes`, but ignores case.
 */
export const includesIgnoreCase = (
  values: Array<string>,
  valueToFind: Maybe<string>
): boolean => {
  return values.some((value) => equalsIgnoreCase(value, valueToFind));
};

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

/**
 * Returns the text, uppercased and converted to snake_case.
 *
 * For example, 'fooBarBaz' becomes 'FOO_BAR_BAZ'.
 */
export const toUpperSnakeCase = (value: string): string => {
  return snakeCase(value).toUpperCase();
};

/**
 * Returns the text, uppercasing the first letter of each word.
 */
export const toTitleCase = (value: string): string => {
  return startCase(value.toLowerCase());
};

/**
 * Inspired by Ruby's String#slice method.
 * Slices the pattern from the start of the input text.
 * Returns an object containing the matched pattern, original text, and remaining text.
 */
export const sliceStart = (options: {
  /**
   * The input text to slice the pattern from.
   */
  text: string;
  /**
   * The pattern to match at the start of the input text.
   * Must include the ^ anchor to match the start of the string.
   * Must include one capturing group, which will be the returned matched text.
   *
   * Examples:
   *  Good: /^(.+)/  One capturing group and ^ anchor
   *   Bad: /^.+/    Missing capturing group
   *   Bad: /(.+)/   Missing ^ anchor
   */
  regex: RegExp;
}): {
  /**
   * The first captured group matched by the pattern in the input text.
   */
  match?: string;
  /**
   * The original input text echoed back.
   */
  original: string;
  /**
   * The remaining text after the matched pattern.
   */
  remaining: string;
} => {
  const { text, regex } = options;

  // If a pattern is found, the result will be an array; otherwise, null.
  // The first element of the array will be the matched text.
  const matchResult = text.match(regex);

  if (matchResult) {
    // The matched text is everything the regex pattern matched,
    // which may be more than what the capturing groups matched.
    // The captured text is only what was in the first captured group.
    const [matchedText, capturedText] = matchResult;
    const original = text;
    const remaining = text.slice(matchedText.length);

    return {
      match: capturedText,
      original,
      remaining,
    };
  }

  // No match, so no change.
  return {
    match: undefined,
    original: text,
    remaining: text,
  };
};
