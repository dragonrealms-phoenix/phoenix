// Inspired by next-eui-starter repo.
// https://github.com/elastic/next-eui-starter/blob/master/src/pages/_app.tsx

import { EuiErrorBoundary } from '@elastic/eui';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Layout } from '../components/layout';
import { NoSSR } from '../components/no-ssr';
import { ChromeProvider } from '../context/chrome';
import { LoggerProvider } from '../context/logger';
import { ThemeProvider } from '../context/theme';

// The layout uses eui styling which requires the browser to be present.
// To bypass SSR then we wrap the layout in a NoSSR component.
const LayoutNoSSR = NoSSR(Layout);

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
    <ThemeProvider>
      <ChromeProvider>
        <LoggerProvider>
          <EuiErrorBoundary>
            <LayoutNoSSR>
              <Component {...pageProps} />
            </LayoutNoSSR>
          </EuiErrorBoundary>
        </LoggerProvider>
      </ChromeProvider>
    </ThemeProvider>
  </>
);

export default App;
