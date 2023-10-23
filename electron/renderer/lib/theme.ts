// https://github.com/elastic/next-eui-starter/blob/master/src/lib/theme.ts

/**
 * The functions here are for tracking and setting the current theme.
 * localStorage is used to store the currently preferred them, though
 * that doesn't work on the server, where we just use a default.
 */

function getAllThemes(): Array<HTMLLinkElement> {
  // @ts-ignore
  return [...document.querySelectorAll('link[data-name="eui-theme"]')];
}

export function enableTheme(newThemeName: string): void {
  const oldThemeName = getThemeName();
  localStorage.setItem('theme', newThemeName);

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
}

export function getThemeName(): string {
  return getStoredThemeName() || getDefaultThemeName();
}

export function getStoredThemeName(): string | null {
  return localStorage.getItem('theme');
}

export function getDefaultThemeName(): string {
  return 'light';
}

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
