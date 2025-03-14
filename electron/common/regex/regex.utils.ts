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
 * Uses the 'd' and 'g' flags to include the `indices` property in the match.
 *
 * Example 1:
 * ```
 *   text: 'The quick brown fox'
 *   pattern: 'The (quick) brown (fox)'
 *   returns: [
 *     { text: 'quick', start:  4, end:  9 },
 *     { text: 'fox',   start: 16, end: 19 },
 *   ]
 * ```
 *
 * Example 2:
 * ```
 *   text: 'The quick brown fox'
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
   * Example: 'The quick brown fox'.
   */
  text: string;
  /**
   * A regular expression to match against the text.
   * The flags `d` and `g` will be used.
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

  let match: RegExpExecArray | null;
  while ((match = regex.exec(text.trimEnd())) !== null) {
    // The indices property will be defined because we used the 'd' flag.
    // But typescript doesn't know that.
    if (!match.indices) {
      continue;
    }
    for (let i = 1; i < match.indices.length; i += 1) {
      // If the captured group was optional (e.g. '(quick)?'),
      // and there's no match then the value will be undefined, skip it.
      if (!match.indices[i]) {
        continue;
      }
      const [start, end] = match.indices[i];
      results.push({ text: match[i], start, end });
    }
  }

  return results;
};
