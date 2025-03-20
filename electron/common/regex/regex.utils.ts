import { getCachedRegExp } from './regex.cache.js';
import type { RegExpMatchResult } from './types.js';

/**
 * Filters out matches that are enclosed by other matches
 * to produce a minimal and complete set of matches.
 *
 * Example Input:
 * ```
 *   [
 *     { text: 'quick brown fox', start:  4, end: 19 },
 *     { text: 'quick', start:  4, end:  9 },
 *     { text: 'fox',   start: 16, end: 19 },
 *   ]
 * ```
 *
 * Example Output:
 * ```
 *   [
 *     { text: 'quick brown fox', start:  4, end: 19 },
 *   ]
 * ```
 */
export const filterToMinimalCompleteMatches = <
  T extends { start: number; end: number },
>(
  matches: Array<T>
): Array<T> => {
  if (matches.length === 0) {
    return [];
  }

  // The matches must be sorted by start index otherwise
  // the algorithm won't return the correct results.
  matches.sort((a, b) => a.start - b.start);

  const results = new Array<T>();

  // Track the last known match that is not enclosed by another match.
  let lastMatch = matches[0];

  // For each other match, check if it's enclosed by the last match.
  // If it is, skip it. If it's not, add the last match to results.
  for (let i = 1; i < matches.length; i += 1) {
    const current = matches[i];

    // Current match is enclosed by the last match, skip it.
    if (lastMatch.start <= current.start && current.end <= lastMatch.end) {
      continue;
    }

    // Add the last match to results if it's not enclosed.
    results.push(lastMatch);
    lastMatch = current;
  }

  results.push(lastMatch);

  return results;
};

/**
 * Executes a regex pattern against text then returns all the captured groups.
 *
 * Example 1:
 * ```
 *   text: 'The quick brown fox jumped over the lazy dog'
 *   pattern: 'The (quick) brown (fox)'
 *   returns: [
 *     { text: 'quick', start:  4, end:  9 },
 *     { text: 'fox',   start: 16, end: 19 },
 *   ]
 * ```
 *
 * Example 2:
 * ```
 *   text: 'The quick brown fox jumped over the lazy dog'
 *   pattern: 'The ((quick) brown (fox))'
 *   returns: [
 *     { text: 'quick brown fox', start:  4, end: 19 },
 *     { text: 'quick', start:  4, end:  9 },
 *     { text: 'fox',   start: 16, end: 19 },
 *   ]
 * ```
 */
export const getAllMatches = (options: {
  /**
   * The text to search for matches.
   *
   * Example: 'The quick brown fox jumped over the lazy dog'.
   */
  text: string;
  /**
   * A regular expression to match against the text.
   *
   * Example: '^The (quick) brown (fox)'.
   */
  pattern: string;
}): Array<RegExpMatchResult> => {
  const { text, pattern } = options;

  const results = new Array<RegExpMatchResult>();

  // For performance, cache compiled regex patterns.
  // Use 'd' flag so we get the start/end indices of each match.
  // Use 'g' flag so ^ and $ match the start and end of each line.
  const regex = getCachedRegExp(pattern, 'dg');

  // Remove trailing whitespace, such as newlines (\n) that
  // may have been parsed from the game stream. User's don't
  // expect to need to specify them in their regex settings.
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text.trimEnd())) !== null) {
    // The indices property will be defined because we used the 'd' flag.
    // But typescript doesn't know that.
    if (!match?.indices) {
      continue;
    }

    for (let i = 1; i < match.indices.length; i += 1) {
      // If the captured group was optional (e.g. '(quick)?'),
      // and there's no match then the value will be undefined, skip it.
      if (!match.indices[i]) {
        continue;
      }

      const [start, end] = match.indices[i];

      results.push({
        text: match[i],
        start,
        end,
      });
    }
  }

  return results;
};

/**
 * Returns true if the pattern is found in the text.
 */
export const isMatch = (option: {
  /**
   * The text to search for matches.
   *
   * Example: 'The quick brown fox jumped over the lazy dog'.
   */
  text: string;
  /**
   * A regular expression to match against the text.
   *
   * Example: '^The (quick|agile) brown fox'.
   */
  pattern: string;
}): boolean => {
  const { text, pattern } = option;

  // For performance, cache compiled regex patterns.
  // Use 'g' flag so ^ and $ match the start and end of each line.
  const regex = getCachedRegExp(pattern, 'g');

  return regex.test(text);
};

/**
 * Returns the `textToReplace` with any numerical regex tokens
 * replaced with the captured groups from executing the `pattern`
 * against the `textToMatch`.
 *
 * Originally designed to replace regex tokens in trigger actions.
 */
export const replaceTokensWithMatches = (options: {
  /**
   * The text to search for matches.
   *
   * Example: 'Katoak arrives.'.
   */
  textToMatch: string;
  /**
   * The text with numerical regex tokens to replace with any matches.
   *
   * Example: 'say "Hello, $1"' ==> 'say "Hello, Katoak"'.
   */
  textToReplace: string;
  /**
   * A regular expression to match against the text.
   *
   * Example: '^(.*?) arrives.'.
   */
  pattern: string;
}): {
  /**
   * Denotes if the pattern matched the text-to-match.
   * If yes, then any captured groups may have been
   * used to replace tokens in the text-to-replace.
   */
  patternMatchedText: boolean;
  /**
   * The text-to-replace with any numerical regex tokens replaced.
   * If no matches were found, or if the tokens were not replaced,
   * then this will be the same as the original text-to-replace.
   */
  replacedText: string;
} => {
  const { textToMatch, textToReplace, pattern } = options;

  // For performance, cache compiled regex patterns.
  // Use 'g' flag so ^ and $ match the start and end of each line.
  const regex = getCachedRegExp(pattern, 'g');

  // Remove trailing whitespace, such as newlines (\n) that
  // may have been parsed from the game stream. User's don't
  // expect to need to specify them in their regex settings.
  const match = regex.exec(textToMatch.trimEnd());

  let patternMatchedText = false;
  let replacedText = textToReplace;

  if (match) {
    patternMatchedText = true;
    for (let i = 1; i < match.length; i += 1) {
      const token = `$${i}`; // e.g. $1, $2, $3, etc.
      replacedText = replacedText.replaceAll(token, match[i] ?? token);
    }
  }

  return {
    patternMatchedText,
    replacedText,
  };
};
