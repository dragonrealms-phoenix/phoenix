// Inspired by next-eui-starter repo.
// https://github.com/elastic/next-eui-starter/blob/master/src/pages/_document.tsx

import { Head, Html, Main, NextScript } from 'next/document';
import type { LinkHTMLAttributes, ReactElement } from 'react';
import type React from 'react';

/**
 * Nextjs wants you to import CSS stylesheets in the `pages/_app.tsx` file.
 * However, the @elastic/eui library instructs you to load their themes here.
 * We also need to import custom stylesheets, so instead of splitting some
 * of that in the `pages/_app.tsx` file, we do it all here.
 *
 * To get around the eslint rule and console warnings, we cannot use
 * the `<link>` element in the `Head` element directly.
 * So instead we use functions.
 */
function _createStyleLink(
  props: LinkHTMLAttributes<HTMLLinkElement>
): ReactElement {
  return <link rel="stylesheet" {...props} />;
}

/**
 * A custom `Document` is commonly used to augment your application's
 * `<html>` and `<body>` tags. This is necessary because Next.js pages skip
 * the definition of the surrounding document's markup.
 *
 * @see https://nextjs.org/docs/advanced-features/custom-document
 */
const Document: React.FC = () => {
  // const yourCustomStyleLink = useMemo(() => {
  //   return createStyleLink({ href: '/your/custom.min.css' });
  // }, []);

  return (
    <Html lang="en">
      <Head>
        <meta name="eui-styles" />
        <meta name="eui-styles-utility" />
        {/* {yourCustomStyleLink} */}
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
};

Document.displayName = 'Document';

export default Document;
