// Inspired by next-eui-starter repo.
// https://github.com/elastic/next-eui-starter/blob/master/src/lib/theme.ts

import type { EuiThemeColorMode } from '@elastic/eui';
import type { Maybe } from '../../common/types.js';
import { LocalStorage } from './local-storage.js';

/**
 * Gets the user's theme preference.
 */
export const getThemeName = (): EuiThemeColorMode => {
  return getStoredThemeName() || getDefaultThemeName();
};

/**
 * Sets the user's theme preference.
 * Does not actively change the UI look and feel.
 */
export const setThemeName = (themeName: EuiThemeColorMode): void => {
  setStoredThemeName(themeName);
};

const getStoredThemeName = (): Maybe<EuiThemeColorMode> => {
  return LocalStorage.get<EuiThemeColorMode>('theme');
};

const setStoredThemeName = (themeName: EuiThemeColorMode): void => {
  LocalStorage.set<EuiThemeColorMode>('theme', themeName);
};

const getDefaultThemeName = (): EuiThemeColorMode => {
  return 'dark';
};

export interface Theme {
  id: string;
  name: string;
  publicPath: string;
}
