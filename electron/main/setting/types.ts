import type {
  ClassSetting,
  HighlightSetting,
  IgnoreSetting,
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

  // TODO getSubstitutes()
  // TODO getEnabledSubstitutes()

  getTriggers(): Array<TriggerSetting>;
  getEnabledTriggers(): Array<TriggerSetting>;

  clear(): void;

  load(options: { profileName: string }): Promise<void>;
}
