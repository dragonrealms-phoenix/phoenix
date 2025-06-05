import type { SubstituteSetting } from '../../../common/setting/types.js';

export const buildSubstituteSetting = (options: {
  pattern?: string;
  replacement?: string;
  className?: string;
}): SubstituteSetting => {
  const setting: SubstituteSetting = {
    pattern: options.pattern ?? '',
    replacement: options.replacement ?? '',
    className: options.className ?? '',
  };

  return setting;
};
