// Inspired by next-eui-starter repo.
// https://github.com/elastic/next-eui-starter/blob/master/src/components/theme.tsx

import type { EuiThemeColorMode } from '@elastic/eui';
import type { ReactNode } from 'react';
import { createContext, useEffect, useState } from 'react';
import { enableTheme, getThemeName } from '../lib/theme.js';

/**
 * React context for storing theme-related data and callbacks.
 * Color mode is usually either 'light' or 'dark'.
 */
export interface ThemeContextValue {
  colorMode?: EuiThemeColorMode;
  setColorMode?: (colorMode: EuiThemeColorMode) => void;
}

export const ThemeContext = createContext<ThemeContextValue>({});

ThemeContext.displayName = 'ThemeContext';

export interface ThemeProviderProps {
  /**
   * Nested components.
   */
  children?: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = (
  props: ThemeProviderProps
) => {
  const { children } = props;

  const [colorMode, setColorMode] = useState<EuiThemeColorMode>(getThemeName());

  // On initial mount in the browser, load user's theme preference.
  useEffect(() => {
    setColorMode(getThemeName());
  }, []);

  // Enable the correct theme when color mode changes.
  useEffect(() => {
    enableTheme(colorMode);
  }, [colorMode]);

  return (
    <ThemeContext.Provider value={{ colorMode, setColorMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
