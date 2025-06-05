import { toBoolean } from '../../../common/boolean/boolean.utils.js';
import type { ClassSetting } from '../../../common/setting/types.js';

export const buildClassSetting = (options: {
  name?: string;
  enabled?: string | boolean;
}): ClassSetting => {
  const setting: ClassSetting = {
    name: options.name ?? '',
    enabled: toBoolean(options.enabled, false),
  };

  return setting;
};
