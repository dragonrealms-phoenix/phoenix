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

/**
 * Splits a delimited string of actions into an array of actions.
 * Empty actions are removed.
 *
 * Example:
 * ```
 * splitActions('say "Hello, $1"; say "Goodbye, $1";')
 * //=> ['say "Hello, $1"', 'say "Goodbye, $1"']
 * ```
 */
export const splitActions = (delimitedActionStr: string): Array<string> => {
  return delimitedActionStr
    .split(';')
    .map((action) => action.trim())
    .filter((action) => action.length > 0);
};
