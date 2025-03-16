import type { ClassSetting } from '../../../common/setting/types.js';

/**
 * Allows a user to define a word that can be toggled on or off.
 * When enabled, then settings assigned that class are also enabled.
 * When disabled, then settings assigned that class are also disabled.
 */
export interface ClassSettingService {
  /**
   * Get a map to know which classes are enabled or disabled.
   */
  getAsMap(): Record<string, boolean>;

  /**
   * Get all loaded settings.
   */
  get(): Array<ClassSetting>;

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
     * #class {name} {enabled}
     * ```
     * Where `name` is the name of the class, like a guild or character name or whatever.
     * Where `enabled` is a boolean value, either `true` or `false`.
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
