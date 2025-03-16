import { toBoolean } from '../../../common/boolean/boolean.utils.js';
import type { ClassSetting } from '../../../common/setting/types.js';

export const buildClassSetting = (options: {
  name?: string;
  enabled?: string;
}): ClassSetting => {
  const setting: ClassSetting = {
    name: options.name ?? '',
    enabled: toBoolean(options.enabled, false),
  };

  return setting;
};

export const toClassMap = (
  settings: Array<ClassSetting>
): Record<string, boolean> => {
  const map: Record<string, boolean> = {};

  for (const setting of settings) {
    map[setting.name] = setting.enabled;
  }

  return map;
};
