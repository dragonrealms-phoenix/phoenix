import type { SubstituteSetting } from '../../../common/setting/types.js';

/**
 * Allows a user to define a string or regex pattern to
 * replace matched text with a specific string.
 */
export interface SubstituteSettingService {
  /**
   * Append to the loaded settings in memory.
   */
  add(settings: Array<SubstituteSetting>): void;

  /**
   * Get all loaded settings.
   */
  get(): Array<SubstituteSetting>;

  /**
   * Remove all loaded settings from memory.
   * To load new settings, call {@link load} or {@link add}.
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
     * #subs {pattern} {replacement} {class}
     * ```
     * Where `pattern` is the string or regex pattern to match.
     * Where `replacement` is the string to replace the matched text with.
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
