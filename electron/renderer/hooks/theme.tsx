import { useContext } from 'react';
import type { ThemeContextValue } from '../context/theme.jsx';
import { ThemeContext } from '../context/theme.jsx';

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
