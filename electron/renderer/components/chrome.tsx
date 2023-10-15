// https://github.com/elastic/next-eui-starter/blob/master/src/components/chrome/index.tsx

import { EuiProvider, EuiThemeColorMode } from '@elastic/eui';
import createCache from '@emotion/cache';
import { FunctionComponent } from 'react';
import { useTheme } from './theme';

/**
 * Renders the UI that surrounds the page content.
 * Must be nested within the `ThemeProvider`.
 */
export const ChromeProvider: FunctionComponent<any> = ({ children }) => {
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
      colorMode={colorMode as EuiThemeColorMode}
      cache={{ default: defaultCache, utility: utilityCache }}
    >
      {children}
    </EuiProvider>
  );
};

function getNodeBySelector(selector: string): Node | undefined {
  const hasDocument = typeof document !== 'undefined';
  if (hasDocument) {
    return document.querySelector(selector) ?? undefined;
  }
}
