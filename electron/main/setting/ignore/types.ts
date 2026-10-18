import type { IgnoreSetting } from '../../../common/setting/types.js';

/**
 * Allows a user to define a string or regex pattern to
 * hide matched text from game streams.
 */
export interface IgnoreSettingService {
  /**
   * Append to the loaded settings in memory.
   */
  add(settings: Array<IgnoreSetting>): void;

  /**
   * Get all loaded settings.
   */
  get(): Array<IgnoreSetting>;

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
     * #ignore {pattern} {class}
     * ```
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
