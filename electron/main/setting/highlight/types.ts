import type { HighlightSetting } from '../../../common/setting/types.js';

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
