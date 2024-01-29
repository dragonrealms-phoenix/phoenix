import { useContext } from 'react';
import type { ThemeContextValue } from '../context/theme.js';
import { ThemeContext } from '../context/theme.js';

/**
 * To use this hook, the component must be inside a `ThemeProvider` hierarchy.
 *
 * Usage:
 * ```
 * const { colorMode, setColorMode } = useTheme();
 * ```
 */
export const useTheme = (): ThemeContextValue => {
  return useContext(ThemeContext);
};
