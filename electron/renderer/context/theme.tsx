// Inspired by next-eui-starter repo.
// https://github.com/elastic/next-eui-starter/blob/master/src/components/theme.tsx

import type { EuiThemeColorMode } from '@elastic/eui';
import { EuiProvider } from '@elastic/eui';
import type { ReactNode } from 'react';
import { createContext, useEffect, useMemo, useState } from 'react';
import { getThemeName, setThemeName } from '../lib/theme.js';

/**
 * React context for storing theme-related data and callbacks.
 * Color mode is usually either 'light' or 'dark'.
 */
export interface ThemeContextValue {
  colorMode: EuiThemeColorMode;
  setColorMode: (colorMode: EuiThemeColorMode) => void;
}

/**
 * Defines shape and behavior of the context value
 * when no provider is found in the component hierarchy.
 */
export const ThemeContext = createContext<ThemeContextValue>({
  colorMode: getThemeName(),
  setColorMode: setThemeName,
});

ThemeContext.displayName = 'ThemeContext';

export interface ThemeProviderProps {
  /**
   * Nested components.
   */
  children?: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = (
  props: ThemeProviderProps
): ReactNode => {
  const { children } = props;

  const [colorMode, setColorMode] = useState<EuiThemeColorMode>(getThemeName());

  // On initial mount in the browser, load user's theme preference.
  useEffect(() => {
    setColorMode(getThemeName());
  }, []);

  // Save user's theme preference.
  useEffect(() => {
    setThemeName(colorMode);
  }, [colorMode]);

  const contextValue = useMemo((): ThemeContextValue => {
    return { colorMode, setColorMode };
  }, [colorMode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <EuiProvider colorMode={colorMode}>{children}</EuiProvider>
    </ThemeContext.Provider>
  );
};
