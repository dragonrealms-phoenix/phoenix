import { runInBackground } from '../../async/run-in-background.js';
import { Preferences } from '../../preference/preference.instance.js';
import { PreferenceKey } from '../../preference/types.js';
import { getMenuItemById } from './get-menu-item-by-id.js';

let confirmBeforeClose = true;

export const loadConfirmBeforeClosePreference = (): void => {
  runInBackground(async () => {
    const value = await Preferences.get(PreferenceKey.WINDOW_CONFIRM_ON_CLOSE);
    if (value !== undefined) {
      setConfirmBeforeClose(value);
    }
  });
};

export const saveConfirmBeforeClosePreference = (value: boolean): void => {
  runInBackground(async () => {
    await Preferences.set(PreferenceKey.WINDOW_CONFIRM_ON_CLOSE, value);
  });
};

export const getConfirmBeforeClose = (): boolean => {
  return confirmBeforeClose;
};

export const setConfirmBeforeClose = (value: boolean): void => {
  confirmBeforeClose = value;
  saveConfirmBeforeClosePreference(confirmBeforeClose);

  // Update the menu item checkbox so that visually it matches the preference.
  const menuItem = getMenuItemById('confirm-before-close');
  if (menuItem) {
    menuItem.checked = confirmBeforeClose;
  }
};

export const toggleConfirmBeforeClose = (): void => {
  setConfirmBeforeClose(!confirmBeforeClose);
};
