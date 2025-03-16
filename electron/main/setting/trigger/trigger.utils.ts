import type { TriggerSetting } from '../../../common/setting/types.js';

export const buildTriggerSetting = (options: {
  pattern?: string;
  action?: string;
  className?: string;
}): TriggerSetting => {
  const setting: TriggerSetting = {
    pattern: options.pattern ?? '',
    action: options.action ?? '',
    className: options.className ?? '',
  };

  return setting;
};

export const splitActions = (delimitedActionStr: string): Array<string> => {
  return delimitedActionStr
    .split(';')
    .map((action) => action.trim())
    .filter((action) => action.length > 0);
};
