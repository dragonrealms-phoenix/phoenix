// https://github.com/elastic/next-eui-starter/blob/master/src/pages/_document.tsx

import Document, { Head, Html, Main, NextScript } from 'next/document';
import type { LinkHTMLAttributes, ReactElement } from 'react';
import { createElement } from 'react';
import type { Theme } from '../lib/theme';
import { getDefaultThemeName, themeConfig } from '../lib/theme';

function createThemeLink(theme: Theme): ReactElement {
  let disabledProps = {};

  if (theme.id !== getDefaultThemeName()) {
    disabledProps = {
      'disabled': true,
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
 * Nextjs wants you to import CSS stylesheets in the `pages/_app.tsx` file.
 * However, the @elastic/eui library instructs you to load their themes here.
 * We also need to import the react-grid-layout stylesheets, so instead of
 * splitting some of that in the `pages/_app.tsx` file, we do it all here.
 *
 * To get around the eslint rule and console warnings, we cannot use
 * the `<link>` element in the `Head` element directly.
 * So instead we use functions.
 */
function createStyleLink(
  props: LinkHTMLAttributes<HTMLLinkElement>
): ReactElement {
  return createElement<LinkHTMLAttributes<HTMLLinkElement>>('link', {
    rel: 'stylesheet',
    ...props,
  });
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
          {createStyleLink({ href: '/react-grid/layout.min.css' })}
          {createStyleLink({ href: '/react-grid/resizable.min.css' })}
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
