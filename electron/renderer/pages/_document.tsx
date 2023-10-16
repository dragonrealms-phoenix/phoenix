// https://github.com/elastic/next-eui-starter/blob/master/src/pages/_document.tsx

import Document, { Head, Html, Main, NextScript } from 'next/document';
import { ReactElement } from 'react';
import { Theme, getDefaultThemeName, themeConfig } from '../lib/theme';

function createThemeLink(theme: Theme): ReactElement {
  let disabledProps = {};

  if (theme.id !== getDefaultThemeName()) {
    disabledProps = {
      disabled: true,
      'aria-disabled': true,
    };
  }

  return (
    <link
      rel="stylesheet"
      href={`/${theme.publicPath}`}
      data-name="eui-theme"
      data-theme-name={theme.name}
      data-theme={theme.id}
      key={theme.id}
      {...disabledProps}
    />
  );
}

/**
 * A custom `Document` is commonly used to augment your application's
 * `<html>` and `<body>` tags. This is necessary because Next.js pages skip
 * the definition of the surrounding document's markup.
 *
 * @see https://nextjs.org/docs/advanced-features/custom-document
 */
export default class MyDocument extends Document {
  render(): ReactElement {
    return (
      <Html lang="en">
        <Head>
          <meta name="eui-styles" />
          {themeConfig.availableThemes.map((theme) => createThemeLink(theme))}
          <meta name="eui-styles-utility" />
          <meta
            httpEquiv="Content-Security-Policy"
            content={`
              default-src 'none';
              script-src 'self' 'unsafe-eval';
              img-src 'self' data:;
              style-src 'self' 'unsafe-inline';
              font-src 'self';
              connect-src 'self' ${process.env.SENTRY_INGEST_DOMAIN};
            `}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
