import type { HighlightSetting } from '../../common/setting/types.js';

export interface SettingService {
  // TODO getAliases()

  getHighlights(): Array<HighlightSetting>;

  // TODO getIgnores()

  // TODO getMacros()

  // TODO getSubstitutes()

  // TODO getTriggers()

  clear(): void;

  load(options: { profileName: string }): Promise<void>;
}
