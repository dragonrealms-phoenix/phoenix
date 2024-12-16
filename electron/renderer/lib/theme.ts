// Inspired by next-eui-starter repo.
// https://github.com/elastic/next-eui-starter/blob/master/src/lib/theme.ts

import type { EuiThemeColorMode } from '@elastic/eui';
import type { Maybe } from '../../common/types.js';
import { LocalStorage } from './local-storage.js';

/**
 * Find all the theme links on the page that we could switch between.
 * See `_document.tsx` for how these are added to the page.
 */
const getAllThemeLinks = (): Array<HTMLLinkElement> => {
  return [
    ...document.querySelectorAll<HTMLLinkElement>(
      'link[data-name="eui-theme"]'
    ),
  ];
};

/**
 * Find the theme link on the page that matches the given theme name.
 */
const getThemeLink = (themeName: EuiThemeColorMode): Maybe<HTMLLinkElement> => {
  return getAllThemeLinks().find((themeLink) => {
    return themeLink.dataset.theme === themeName;
  });
};

/**
 * Sets the user's theme preference and actively updates the UI to match.
 * To only set the preference without updating the UI, use `setThemeName`.
 */
export const enableTheme = (newThemeName: EuiThemeColorMode): void => {
  const oldThemeName = getThemeName();
  setThemeName(newThemeName);

  const newThemeLink = getThemeLink(newThemeName);

  if (!newThemeLink) {
    return;
  }

  // When toggling the theme, to prevent a flash of unstyled content
  // then preload the new theme's CSS before enabling it.
  const preloadThemeLink = document.createElement('link');
  preloadThemeLink.rel = 'preload';
  preloadThemeLink.as = 'style';
  preloadThemeLink.href = newThemeLink.href;
  document.head.appendChild(preloadThemeLink);

  // Once the new theme is loaded then we can disable the old theme.
  // Because the new theme is preloaded, the change should be instant.
  preloadThemeLink.onload = () => {
    for (const themeLink of getAllThemeLinks()) {
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

    // Remove the preload link element.
    document.head.removeChild(preloadThemeLink);
  };
};

/**
 * Gets the user's theme preference.
 */
export const getThemeName = (): EuiThemeColorMode => {
  return getStoredThemeName() || getDefaultThemeName();
};

/**
 * Sets the user's theme preference.
 * Does not actively change the UI look and feel.
 * To do that, use `enableTheme` or reload the app.
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
