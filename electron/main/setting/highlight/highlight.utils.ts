import type { HighlightSetting } from 'common/setting/types';
import RegExpEscape from 'regexp.escape';
import {
  filterToMinimalCompleteMatches,
  getAllMatches,
} from '../../../common/regex/regex.utils.js';
import type { HighlightedTextSegment } from '../../../common/setting/types.js';
import { HighlightMatchType } from '../../../common/setting/types.js';
import { logger } from './logger.js';

/**
 * Apply multiple regex patterns to highlight a line of text.
 */
export const applyHighlights = (options: {
  text: string;
  highlights: Array<HighlightSetting>;
}): Array<HighlightedTextSegment> => {
  const { text, highlights } = options;

  const results = new Array<HighlightedTextSegment>();

  try {
    let segments = new Array<HighlightedTextSegment>();

    for (const highlight of highlights) {
      const matches = filterToMinimalCompleteMatches(
        getAllMatches({
          text,
          pattern: highlight.pattern,
        })
      );

      // Combine each match with their highlight settings.
      for (const match of matches) {
        segments.push({
          // What to highlight
          text: match.text,
          start: match.start,
          end: match.end,
          // How to highlight
          foregroundColor: highlight.foregroundColor,
          backgroundColor: highlight.backgroundColor,
        });
      }
    }

    // We need one more pass to consolidate overlapping segments
    // since different patterns may match the same text.
    segments = filterToMinimalCompleteMatches(segments);

    // Process text into non-overlapping highlighted segments.
    // Iterate the sorted matches, checking if the current entry starts within
    // the previous entry. If yes, then split the previous entry into two such
    // that the first part of the previous entry ends at the start of the current entry,
    // and the second part of the previous entry starts at the end of the current entry.
    // In this way, ensure that all entries never overlap.
    //
    // Example Input:
    /*
     *   [
     *     { text: 'quick brown fox', start: 4, end: 19 },
     *     { text: 'brown', start: 10, end: 15 },
     *     { text: 'ow', start: 12, end: 14 },
     *     { text: 'fox jumped', start: 16, 26 }
     *   ]
     */
    // Sort elements and split a previous element if it encloses the current element.
    // In this pass, we split "quick brown fox" because it encloses "brown".
    /*
     *  [
     *    { text: 'quick ', start: 4, end: 10 },
     *    { text: 'brown', start: 10, end: 15 },
     *    { text: ' fox', start: 15, end: 19 },
     *    { text: 'ow', start: 12, end: 14 },
     *    { text: 'fox jumped', start: 16, 26 }
     *  ]
     */
    // No other contiguous elements overlap, so resort and do another pass.
    // In this pass, we split "brown" because it encloses "ow".
    /*
     *  [
     *    { text: 'quick ', start: 4, end: 10 },
     *    { text: 'br', start: 10, end: 12 },
     *    { text: 'ow', start: 12, end: 14 },
     *    { text: 'n', start: 14, end: 15 },
     *    { text: ' fox', start: 15, end: 19 },
     *    { text: 'fox jumped', start: 16, 26 }
     *  ]
     */
    // No other contiguous elements overlap, so resort and do another pass.
    // Since no further changes made, move to next phase which looks at
    // elements where the end of the previous is the start of the current.
    // In this pass, we split " fox" because it ends with "fox" and the next element starts with "fox".
    /*
     *  [
     *    { text: 'quick ', start: 4, end: 10 },
     *    { text: 'br', start: 10, end: 12 },
     *    { text: 'ow', start: 12, end: 14 },
     *    { text: 'n', start: 14, end: 15 },
     *    { text: ' ', start: 15, end: 16 },
     *    { text: 'fox jumped', start: 16, 26 }
     *  ]
     */

    let keepLooping = true; // default true to enter the loop
    while (keepLooping) {
      keepLooping = false; // but don't loop again unless we make a change

      segments.sort((a, b) => a.start - b.start);

      for (let i = 1; i < segments.length; i += 1) {
        const prev = segments[i - 1];
        const current = segments[i];

        // If the previous segment encloses the current segment, then
        // split the previous into two segments. Namely the text that
        // comes before the current segment, and the text that comes after.
        if (isFullyEnclosedBy({ inner: current, outer: prev })) {
          const first = {
            ...prev,
            text: text.slice(prev.start, current.start),
            start: prev.start,
            end: current.start,
          };

          const second = {
            ...prev,
            text: text.slice(current.end, prev.end),
            start: current.end,
            end: prev.end,
          };

          segments.splice(i - 1, 2, first, current, second);

          // We split segments, we will need to sort and loop again
          // to see if there's any further changes to be made.
          keepLooping = true;
        } else if (isPartiallyEnclosedBy({ left: prev, right: current })) {
          prev.text = text.slice(prev.start, current.start);
          prev.end = current.start;

          // We didn't modify the ordering of the segments,
          // so no need to loop again. Leave loop flag value as-is.
        }
      }
    }

    // Fill in the gaps between segments with unhighlighted text.
    for (let i = 0; i < segments.length; i += 1) {
      const prev = segments[i - 1];
      const current = segments[i];

      // If the first segment starts after the beginning of the text,
      // then add an unhighlighted segment from the beginning of the text.
      if (i === 0 && current.start > 0) {
        const unhighlighted: HighlightedTextSegment = {
          text: text.slice(0, current.start),
          start: 0,
          end: current.start,
          foregroundColor: '',
          backgroundColor: '',
        };
        results.push(unhighlighted);
      }

      // If the current segment doesn't start where the previous segment ends,
      // then add an unhighlighted segment between the two segments.
      if (prev && prev.end !== current.start) {
        const unhighlighted: HighlightedTextSegment = {
          text: text.slice(prev.end, current.start),
          start: prev.end,
          end: current.start,
          foregroundColor: '',
          backgroundColor: '',
        };
        results.push(unhighlighted);
      }

      results.push(current);

      // If the last segment doesn't end at the end of the text,
      // then add an unhighlighted segment from it to the end of the text.
      if (i === segments.length - 1 && current.end < text.length) {
        const unhighlighted: HighlightedTextSegment = {
          text: text.slice(current.end),
          start: current.end,
          end: text.length,
          foregroundColor: '',
          backgroundColor: '',
        };
        results.push(unhighlighted);
      }
    }
  } catch (error) {
    // Clear any partial results, otherwise we might emit incomplete text.
    results.length = 0;
    logger.error('error applying highlights, skipping', {
      text,
      error,
    });
  }

  // If no highlights were applied then treat
  // the entire text as a single unhighlighted segment.
  if (results.length === 0) {
    results.push({
      text,
      start: 0,
      end: text.length,
      foregroundColor: '',
      backgroundColor: '',
    });
  }

  return results;
};

/**
 * Determines if the inner segment is enclosed by the outer segment.
 * A segment encloses another if the outer segment starts on or before
 * the inner segment, and ends on or after the inner segment.
 */
export const isFullyEnclosedBy = (options: {
  /**
   * The segment to determine if it's enclosed by the outer segment.
   */
  inner: { start: number; end: number };
  /**
   * The segment to determine if it encloses the inner segment.
   */
  outer: { start: number; end: number };
}): boolean => {
  const { inner, outer } = options;

  const startsWithin = outer.start <= inner.start;
  const endsWithin = inner.end <= outer.end;

  return startsWithin && endsWithin;
};

/**
 * Determines if exists some number N of characters such that
 * the last N characters of the left segment are the same as
 * the first N characters of the right segment.
 */
export const isPartiallyEnclosedBy = (options: {
  left: { start: number; end: number };
  right: { start: number; end: number };
}): boolean => {
  const { left, right } = options;

  const startsWithin = left.start <= right.start && right.start < left.end;
  const endsAfter = left.end <= right.end;

  return startsWithin && endsAfter;
};

export const buildHighlightSetting = (options: {
  matchType?: string;
  text?: string;
  pattern?: string;
  foregroundColor?: string;
  backgroundColor?: string;
  className?: string;
}): HighlightSetting => {
  const matchType = getMatchType(options.matchType ?? '');
  const text = options.text ?? '';
  const pattern = options.pattern ?? getRegexPattern({ matchType, text });
  const foregroundColor = options.foregroundColor ?? '';
  const backgroundColor = options.backgroundColor ?? '';
  const className = options.className ?? '';

  const highlight: HighlightSetting = {
    matchType,
    text,
    pattern,
    foregroundColor,
    backgroundColor,
    className,
  };

  return highlight;
};

/**
 * Converts a Genie match type to our enum.
 */
export const getMatchType = (type: string): HighlightMatchType => {
  let matchType: HighlightMatchType;

  switch (type) {
    case 'line':
    case 'lines':
    case HighlightMatchType.CONTAINS:
      matchType = HighlightMatchType.CONTAINS;
      break;

    case 'beginswith':
    case 'startswith':
    case HighlightMatchType.STARTS:
      matchType = HighlightMatchType.STARTS;
      break;

    case 'regex':
    case 'regexp':
    case HighlightMatchType.REGEX:
      matchType = HighlightMatchType.REGEX;
      break;

    case 'string':
    case 'strings':
    case HighlightMatchType.EXACT:
    default:
      matchType = HighlightMatchType.EXACT;
      break;
  }

  return matchType;
};

/**
 * A regular expression inferred from the pattern and match type.
 * For example, when the match type is not a regex then the pattern
 * should be interpreted literally, and so characters that have special
 * meanings in regular expressions should be escaped.
 * Use this value to create `RegExp` objects.
 */
export const getRegexPattern = (options: {
  matchType: HighlightMatchType;
  text: string;
}): string => {
  const { matchType, text } = options;

  let pattern = text;

  switch (matchType) {
    case HighlightMatchType.EXACT:
      pattern = '^(' + RegExpEscape(text) + ')$';
      break;

    case HighlightMatchType.STARTS:
      pattern = '^(' + RegExpEscape(text) + '.*?)$';
      break;

    case HighlightMatchType.CONTAINS:
      pattern = '^(.*?' + RegExpEscape(text) + '.*?)$';
      break;

    case HighlightMatchType.REGEX:
      pattern = text;
      break;
  }

  return pattern;
};
