// Inspired by next-eui-starter repo.
// https://github.com/elastic/next-eui-starter/blob/master/src/pages/_app.tsx

import { EuiErrorBoundary } from '@elastic/eui';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Layout } from '../components/layout.jsx';
import { NoSSRBoundary } from '../components/no-ssr/no-ssr.jsx';
import { ChromeProvider } from '../context/chrome.jsx';
import { GameProvider } from '../context/game.jsx';
import { LoggerProvider } from '../context/logger.jsx';
import { ThemeProvider } from '../context/theme.jsx';

/**
 * Next.js uses the App component to initialize pages. You can override it
 * and control the page initialization.
 *
 * @see https://nextjs.org/docs/advanced-features/custom-app
 */
const App: React.FC<AppProps> = ({ Component, pageProps }: AppProps) => (
  <>
    <Head>
      <title>DragonRealms Phoenix</title>
    </Head>
    {/*
      The EUI components require the `window` object; they are not SSR compatible.
      https://stackoverflow.com/questions/53139884/next-js-disable-server-side-rendering-on-some-pages/64509306
     */}
    <NoSSRBoundary>
      <ThemeProvider>
        <ChromeProvider>
          <LoggerProvider>
            <EuiErrorBoundary>
              <GameProvider>
                <Layout>
                  <Component {...pageProps} />
                </Layout>
              </GameProvider>
            </EuiErrorBoundary>
          </LoggerProvider>
        </ChromeProvider>
      </ThemeProvider>
    </NoSSRBoundary>
  </>
);

export default App;
