import type {
  ClassSetting,
  HighlightSetting,
  IgnoreSetting,
  SubstituteSetting,
  TriggerSetting,
} from '../../common/setting/types.js';

export interface SettingService {
  getClasses(): Array<ClassSetting>;
  upsertClass(setting: ClassSetting): void;

  // TODO getAliases()
  // TODO getEnabledAliases()

  getHighlights(): Array<HighlightSetting>;
  getEnabledHighlights(): Array<HighlightSetting>;

  getIgnores(): Array<IgnoreSetting>;
  getEnabledIgnores(): Array<IgnoreSetting>;

  // TODO getMacros()
  // TODO getEnabledMacros()

  getSubstitutes(): Array<SubstituteSetting>;
  getEnabledSubstitutes(): Array<SubstituteSetting>;

  getTriggers(): Array<TriggerSetting>;
  getEnabledTriggers(): Array<TriggerSetting>;

  clear(): Promise<void>;

  load(options: {
    /**
     * Load settings for the specified profiles.
     * For example, `default` or `KatoakDR`.
     */
    profileNames: Array<string>;
    /**
     * Whether to append to previously loaded settings or replace them.
     * Using `replace` is the same as calling {@link clear} then {@link load}.
     * Default is `append`.
     */
    mode?: 'append' | 'replace';
  }): Promise<void>;
}
