// https://github.com/elastic/next-eui-starter/blob/master/src/components/theme.tsx

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import {
  enableTheme,
  getDefaultThemeName,
  getThemeName,
} from '../../lib/theme';

/**
 * React context for storing theme-related data and callbacks.
 * Color mode is usually either 'light' or 'dark'.
 */
interface ThemeContextValue {
  colorMode?: string;
  setColorMode?: (colorMode: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({});

interface ThemeProviderProps {
  children?: ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = (
  props: ThemeProviderProps
) => {
  const { children } = props;

  const [colorMode, setColorMode] = useState(getDefaultThemeName());

  // On initial mount in the browser, use any theme from local storage.
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

const useTheme = (): ThemeContextValue => {
  return useContext(ThemeContext);
};

export { ThemeProvider, useTheme };
