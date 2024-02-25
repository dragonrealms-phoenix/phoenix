// Inspired by next-eui-starter repo.
// https://github.com/elastic/next-eui-starter/blob/master/src/lib/theme.ts

import type { EuiThemeColorMode } from '@elastic/eui';
import type { Maybe } from '../../common/types.js';
import { LocalStorage } from './local-storage.js';

/**
 * The functions here are for tracking and setting the current theme.
 * localStorage is used to store the currently preferred them, though
 * that doesn't work on the server, where we just use a default.
 */

const getAllThemes = (): Array<HTMLLinkElement> => {
  // @ts-ignore
  return [...document.querySelectorAll('link[data-name="eui-theme"]')];
};

export const enableTheme = (newThemeName: EuiThemeColorMode): void => {
  const oldThemeName = getThemeName();
  LocalStorage.set<EuiThemeColorMode>('theme', newThemeName);

  for (const themeLink of getAllThemes()) {
    // Disable all theme links, except for the desired theme, which we enable
    themeLink.disabled = themeLink.dataset.theme !== newThemeName;
    themeLink.ariaDisabled = String(themeLink.dataset.theme !== newThemeName);
  }

  // Add a class to the `body` element that indicates which theme we're using.
  // This allows any custom styling to adapt to the current theme.
  if (document.body.classList.contains(`appTheme-${oldThemeName}`)) {
    document.body.classList.replace(
      `appTheme-${oldThemeName}`,
      `appTheme-${newThemeName}`
    );
  } else {
    document.body.classList.add(`appTheme-${newThemeName}`);
  }
};

export const getThemeName = (): EuiThemeColorMode => {
  return getStoredThemeName() || getDefaultThemeName();
};

export const getStoredThemeName = (): Maybe<EuiThemeColorMode> => {
  return LocalStorage.get<EuiThemeColorMode>('theme');
};

export const getDefaultThemeName = (): EuiThemeColorMode => {
  return 'dark';
};

export interface Theme {
  id: string;
  name: string;
  publicPath: string;
}

// This is supplied to the app as JSON by Webpack - see next.config.js
export interface ThemeConfig {
  availableThemes: Array<Theme>;
  copyConfig: Array<{
    from: string;
    to: string;
  }>;
}

// The config is generated during the build and made available in a JSON string.
export const themeConfig: ThemeConfig = JSON.parse(process.env.THEME_CONFIG!);
