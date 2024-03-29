// Inspired by next-eui-starter repo.
// https://github.com/elastic/next-eui-starter/blob/master/src/components/chrome/index.tsx

import { EuiProvider } from '@elastic/eui';
import createCache from '@emotion/cache';
import type { ReactNode } from 'react';
import type { Maybe } from '../../common/types.js';
import { useTheme } from '../hooks/theme.jsx';

export interface ChromeProviderProps {
  /**
   * Nested components.
   */
  children?: ReactNode;
}

/**
 * Renders the UI that surrounds the page content.
 * Must be nested within the `ThemeProvider`.
 */
export const ChromeProvider: React.FC<ChromeProviderProps> = (
  props: ChromeProviderProps
) => {
  const { children } = props;

  const { colorMode } = useTheme();

  /**
   * This `@emotion/cache` instance is used to insert the global styles
   * into the correct location in `<head>`. Otherwise they would be
   * inserted after the static CSS files, resulting in style clashes.
   * Only necessary until EUI has converted all components to CSS-in-JS:
   * https://github.com/elastic/eui/issues/3912
   */
  const defaultCache = createCache({
    key: 'eui',
    container: getNodeBySelector('meta[name="eui-styles"]'),
  });

  const utilityCache = createCache({
    key: 'util',
    container: getNodeBySelector('meta[name="eui-styles-utility"]'),
  });

  return (
    <EuiProvider
      colorMode={colorMode}
      cache={{ default: defaultCache, utility: utilityCache }}
    >
      {children}
    </EuiProvider>
  );
};

function getNodeBySelector(selector: string): Maybe<Node> {
  const hasDocument = typeof document !== 'undefined';
  if (hasDocument) {
    return document.querySelector(selector) ?? undefined;
  }
}
