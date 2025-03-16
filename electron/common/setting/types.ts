export interface HighlightedTextSegment {
  /**
   * The segment of text to highlight.
   * This is a substring between the start and end indices
   * of the original line of text.
   */
  text: string;
  /**
   * The start index of the highlighted segment of text.
   */
  start: number;
  /**
   * The end index of the highlighted segment of text.
   */
  end: number;
  /**
   * The color name or hex code to use for the segment.
   * For example, "red" or "#FF0000".
   * Though any valid CSS color value will work.
   * Use a blank string to not apply a foreground color.
   */
  foregroundColor: string;
  /**
   * The color name or hex code to use for the background for the segment.
   * For example, "blue" or "#0000FF".
   * Though any valid CSS color value will work.
   * Use a blank string to not apply a background color.
   */
  backgroundColor: string;
}

export interface HighlightSetting {
  /**
   * How to interpret the pattern.
   */
  matchType: HighlightMatchType;
  /**
   * Literal or regular expression whose captured groups will be
   * highlighted with the specified colors.
   * See {@link pattern} for the inferred regular expression.
   */
  text: string;
  /**
   * A regular expression inferred from the pattern and match type.
   * For example, when the match type is not a regex then the pattern
   * should be interpreted literally, and so characters that have special
   * meanings in regular expressions should be escaped.
   * Use this value to create `RegExp` objects.
   */
  pattern: string;
  /**
   * Foreground color of the text.
   * A falsy value will not apply a foreground color.
   */
  foregroundColor: string;
  /**
   * Background color of the text.
   * A falsy value will not apply a background color.
   */
  backgroundColor: string;
  /**
   * Optional class name to apply to the highlighted text.
   * Genie uses classes as boolean flags to denote if a setting
   * is enabled or disabled. If the class is enabled then so are
   * all the settings tagged with it.
   */
  className: string;
}

export enum HighlightMatchType {
  /**
   * Highlight only the pattern itself.
   *
   * Genie uses the term "string" or "strings".
   */
  EXACT = 'exact',
  /**
   * Highlight the entire line that contains the pattern.
   *
   * Genie uses the term "line" or "lines".
   */
  CONTAINS = 'contains',
  /**
   * Highlight the entire line that starts with the pattern.
   *
   * Genie uses the term "beginswith"
   */
  STARTS = 'starts',
  /**
   * Highlight within the line the captured groups of the pattern.
   *
   * Genie uses the term "regex" or "regexp".
   */
  REGEX = 'regex',
}

export interface ClassSetting {
  /**
   * The name of the class.
   */
  name: string;
  /**
   * Whether the class is enabled or disabled.
   * When enabled, then settings assigned that class are also enabled.
   * When disabled, then settings assigned that class are also disabled.
   */
  enabled: boolean;
}
