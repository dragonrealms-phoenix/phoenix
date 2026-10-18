import type { HighlightSetting } from '../../../common/setting/types.js';

/**
 * Allows a user to define a string or regex pattern to
 * highlight matched text as a specific color.
 */
export interface HighlightSettingService {
  /**
   * Append to the loaded settings in memory.
   */
  add(settings: Array<HighlightSetting>): void;

  /**
   * Get all loaded settings.
   */
  get(): Array<HighlightSetting>;

  /**
   * Remove all loaded settings from memory.
   * To load new settings, call {@link load}.
   */
  clear(): void;

  /**
   * Load settings from file path.
   * Can be configured to append to or replace the settings in memory.
   * To get all the loaded settings, call {@link get}.
   */
  load(options: {
    /**
     * Path to the settings file.
     *
     * A setting line has the format:
     * ```
     * #highlight {matchType} {fg[,bg]} {pattern} {class}
     * ```
     * Where `matchType` defines how to match the pattern to the text.
     * Where `fg` is the foreground color, like `#ff0000` or `red`.
     * Where `bg` is the background color, like `#0000ff` or `blue`.
     * Where `pattern` is the string or regex pattern to match.
     * Where `class` is the name of the class to assign the setting to.
     */
    filePath: string;
    /**
     * Whether to append to previously loaded settings or replace them.
     * Using `replace` is the same as calling {@link clear} then {@link load}.
     * Default is `append`.
     */
    mode?: 'append' | 'replace';
  }): Promise<void>;
}
