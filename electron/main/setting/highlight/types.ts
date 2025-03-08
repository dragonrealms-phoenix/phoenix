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
   *
   * However, this functionality is not yet implemented in Phoenix
   * but we do parse the data to preserve it for future use.
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

/**
 * Allows a user to define a string or regex pattern to
 * highlight matched text as a specific color.
 */
export interface HighlightSettingService {
  /**
   * Get all loaded settings.
   */
  get(): Array<HighlightSetting>;

  /**
   * Load settings from file path.
   * Can be configured to append to or replace the settings in memory.
   * To get all the loaded settings, call {@link get}.
   */
  load(options: {
    /**
     * Path to the settings file.
     */
    filePath: string;
    /**
     * Whether to append to previously loaded settings or replace them.
     * Using `replace` is the same as calling {@link clear} then {@link load}.
     * Default is `append`.
     */
    mode?: 'append' | 'replace';
  }): Promise<void>;

  /**
   * Remove all loaded settings from memory.
   * To load new settings, call {@link load}.
   */
  clear(): void;
}
