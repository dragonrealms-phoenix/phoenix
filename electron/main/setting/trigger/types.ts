import type { TriggerSetting } from '../../../common/setting/types.js';

/**
 * Allows a user to define a regex pattern to
 * trigger a game command automatically.
 */
export interface TriggerSettingService {
  /**
   * Get all loaded settings.
   */
  get(): Array<TriggerSetting>;

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
     * #trigger {pattern} {action} {class}
     * ```
     * Where `pattern` is the string or regex pattern to match.
     * Where `action` is a semicolon-delimited list of commands to execute.
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
