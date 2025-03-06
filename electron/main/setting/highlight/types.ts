export interface HighlightSetting {
  /**
   * How to interpret the pattern.
   */
  matchType: HighlightMatchType;
  /**
   * Literal or regular expression whose captured groups will be
   * highlighted with the specified colors.
   */
  pattern: string;
  /**
   * Foreground color of the text.
   * A falsy value will not apply a foreground color.
   */
  fgColor: string;
  /**
   * Background color of the text.
   * A falsy value will not apply a background color.
   */
  bgColor: string;
  /**
   * Optional class name to apply to the highlighted text.
   * Genie uses classes as boolean flags to denote if a setting
   * is enabled or disabled. If the class is enabled then so are
   * all the settings tagged with it.
   */
  className?: string;
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

/**
 * Allows a user to define a string or regex pattern to
 * highlight matched text as a specific color.
 */
export interface HighlightSettingService {
  /**
   * Load settings from storage.
   * Replaces all prior loaded settings.
   */
  load(): Promise<Array<HighlightSetting>>;

  // TODO add feature for users to customize settings in app
}
