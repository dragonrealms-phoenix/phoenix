import type {
  ClassSetting,
  HighlightSetting,
} from '../../common/setting/types.js';

export interface SettingService {
  getClasses(): Array<ClassSetting>;

  // TODO getAliases()
  // TODO getEnabledAliases()

  getHighlights(): Array<HighlightSetting>;
  getEnabledHighlights(): Array<HighlightSetting>;

  // TODO getIgnores()
  // TODO getEnabledIgnores()

  // TODO getMacros()

  // TODO getSubstitutes()
  // TODO getEnabledSubstitutes()

  // TODO getTriggers()
  // TODO getEnabledTriggers()

  clear(): void;

  load(options: { profileName: string }): Promise<void>;
}
