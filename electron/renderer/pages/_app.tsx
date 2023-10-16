// https://github.com/elastic/next-eui-starter/blob/master/src/pages/_app.tsx

import { EuiErrorBoundary } from '@elastic/eui';
import { Global } from '@emotion/react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ChromeProvider } from '../components/chrome';
import { LoggerProvider } from '../components/logger';
import { ThemeProvider } from '../components/theme';
import { globalStyles } from '../styles/global.styles';

/**
 * Next.js uses the App component to initialize pages. You can override it
 * and control the page initialization. Here use use it to render the
 * `Chrome` component on each page, and apply an error boundary.
 *
 * @see https://nextjs.org/docs/advanced-features/custom-app
 */
const App: React.FC<AppProps> = ({ Component, pageProps }: AppProps) => (
  <>
    <Head>
      <title>DragonRealms Phoenix</title>
    </Head>
    <Global styles={globalStyles} />
    <ThemeProvider>
      <ChromeProvider>
        <LoggerProvider>
          <EuiErrorBoundary>
            <Component {...pageProps} />
          </EuiErrorBoundary>
        </LoggerProvider>
      </ChromeProvider>
    </ThemeProvider>
  </>
);

export default App;
