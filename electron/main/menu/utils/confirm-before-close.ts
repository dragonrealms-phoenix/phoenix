import { Preferences } from '../../preference/preference.instance.js';
import { PreferenceKey } from '../../preference/types.js';
import { getMenuItemById } from './get-menu-item-by-id.js';

export const getConfirmBeforeClose = (): boolean => {
  return Preferences.get(PreferenceKey.APP_CONFIRM_CLOSE, true);
};

export const setConfirmBeforeClose = (value: boolean): void => {
  Preferences.set(PreferenceKey.APP_CONFIRM_CLOSE, value);

  // Update the menu item checkbox so that visually it matches the preference.
  const menuItem = getMenuItemById('confirm-before-close');
  if (menuItem) {
    menuItem.checked = value;
  }
};

export const toggleConfirmBeforeClose = (): void => {
  const value = getConfirmBeforeClose();
  setConfirmBeforeClose(!value);
};
