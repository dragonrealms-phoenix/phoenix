import type { IgnoreSetting } from '../../../common/setting/types.js';

export const buildIgnoreSetting = (options: {
  pattern?: string;
  className?: string;
}): IgnoreSetting => {
  const setting: IgnoreSetting = {
    pattern: options.pattern ?? '',
    className: options.className ?? '',
  };

  return setting;
};
