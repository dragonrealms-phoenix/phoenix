import { useContext } from 'react';
import type { ThemeContextValue } from '../context/theme';
import { ThemeContext } from '../context/theme';

/**
 * To use this hook, the component must be wrapped in a `ThemeProvider`
 * somewhere in the parent hierarchy.
 */
export const useTheme = (): ThemeContextValue => {
  return useContext(ThemeContext);
};
