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

/**
 * Inspired by Ruby's String#slice method.
 * Slices the pattern from the start of the input text.
 * Returns an object containing the matched pattern, original text, and remaining text.
 */
export function sliceStart(options: {
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
} {
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
}
