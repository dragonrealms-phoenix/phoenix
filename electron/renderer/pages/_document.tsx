// Inspired by next-eui-starter repo.
// https://github.com/elastic/next-eui-starter/blob/master/src/pages/_document.tsx

import { Head, Html, Main, NextScript } from 'next/document';
import type React from 'react';

/**
 * A custom `Document` is commonly used to augment your application's
 * `<html>` and `<body>` tags. This is necessary because Next.js pages skip
 * the definition of the surrounding document's markup.
 *
 * @see https://nextjs.org/docs/advanced-features/custom-document
 */
const Document: React.FC = () => {
  return (
    <Html lang="en">
      <Head>
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
