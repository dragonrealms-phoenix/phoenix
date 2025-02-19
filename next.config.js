// @ts-check

/**
 * Config based on https://github.com/elastic/next-eui-starter
 */

import { execSync } from 'child_process';
import { withSentryConfig } from '@sentry/nextjs';
import dotenv from 'dotenv';
import webpack from 'webpack';

dotenv.config();

const gitHash = execSync('git rev-parse --short HEAD').toString().trim();

const pathPrefix = '';

const { EnvironmentPlugin, IgnorePlugin } = webpack;

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  /**
   * Generate static HTML, CSS, and other files
   * Useful for self-hosting without a Node.js server.
   * We use electron-serve to self-host our renderer app.
   */
  output: 'export',

  experimental: {
    /**
     * Allow importing shared code from outside the renderer module.
     * https://stackoverflow.com/questions/63450928/nextjs-import-external-components-from-parent-directory
     * https://stackoverflow.com/questions/72840513/import-shared-code-in-next-js-app-in-a-monorepo
     */
    externalDir: true,
    /**
     * Use separate webpack worker during compilation to mitigate memory issues.
     * https://github.com/vercel/next.js/pull/57346
     * https://github.com/vercel/next.js/issues/57876
     */
    webpackBuildWorker: true,
    /**
     * Support ESM-style imports that are fully specified with file extensions.
     * https://github.com/vercel/next.js/issues/41961
     */
    fullySpecified: true,
  },

  compiler: {
    /**
     * Enable emotion css transforms, used by @elastic/eui.
     */
    emotion: true,
  },

  /**
   * Generate source maps for use by Sentry.
   */
  productionBrowserSourceMaps: true,

  /**
   * Redirect urls without trailing slashes to their counterparts with them.
   */
  trailingSlash: true,

  /**
   * Disable the `X-Powered-By: Next.js` response header.
   */
  poweredByHeader: false,

  /**
   * When set to something other than '', this field instructs Next to
   * expect all paths to have a specific directory prefix. This fact is
   * transparent to (almost all of) the rest of the application.
   */
  basePath: pathPrefix,

  images: {
    loader: 'custom',
  },

  /**
   * Set custom `process.env.SOMETHING` values to use in the application.
   * You can do this with Webpack's `DefinePlugin`, but this is more concise.
   * It's also possible to provide values via `publicRuntimeConfig`, but
   * this method is preferred as it can be done statically at build time.
   *
   * @see https://nextjs.org/docs/api-reference/next.config.js/environment-variables
   */
  env: {
    PATH_PREFIX: pathPrefix,
  },

  /**
   * Next.js reports TypeScript errors by default. If you don't want to
   * leverage this behavior and prefer something else instead, like your
   * editor's integration, you may want to disable it.
   */
  // typescript: {
  //   ignoreDevErrors: true,
  // },

  /**
   * Before continuing to add custom webpack configuration to your application
   * make sure Next.js doesn't already support your use-case.
   * @see https://nextjs.org/docs/pages/api-reference/next-config-js/webpack
   */
  webpack(
    /** @type {import('webpack').Configuration} */
    config,
    /** @type {import('next/dist/server/config-shared').WebpackConfigContext} */
    context
  ) {
    const { isServer } = context;

    config.externals ||= [];
    config.plugins ||= [];
    config.resolve ||= {};
    config.module ||= {};
    config.module.rules ||= [];

    // EUI uses some libraries and features that don't work outside of a
    // browser by default. We need to configure the build so that these
    // features are either ignored or replaced with stub implementations.
    if (isServer) {
      if (Array.isArray(config.externals)) {
        config.externals = config.externals.map((eachExternal) => {
          if (typeof eachExternal !== 'function') {
            return eachExternal;
          }

          return (
            /** @type {import('webpack').ExternalItemFunctionData} */
            context,
            /** @type {(err?: null | Error, result?: any) => void} */
            callback
          ) => {
            // Exclude EUI from server-side builds
            if (context && context.request) {
              if (context.request.indexOf('@elastic/eui') > -1) {
                return callback();
              }
            }
            return eachExternal(context, callback);
          };
        });
      }

      // Mock HTMLElement on the server-side
      const definePluginId = config.plugins.findIndex((plugin) => {
        return (
          typeof plugin === 'object' && // not undefined
          plugin && // not null
          plugin.constructor && // has a constructor
          plugin.constructor.name === 'DefinePlugin'
        );
      });

      const plugin = /** @type {import('webpack').WebpackPluginInstance} */ (
        config.plugins[definePluginId]
      );

      plugin.definitions = {
        ...plugin.definitions,
        HTMLElement: function () {},
      };
    }

    config.plugins.push(
      new EnvironmentPlugin({
        // Electron renderer process doesn't have node enabled
        // so we need webpack to replace all uses of `process.env`.
        SENTRY_INGEST_DOMAIN: process.env.SENTRY_INGEST_DOMAIN ?? '',
        SENTRY_DSN: process.env.SENTRY_DSN ?? '',
        SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN ?? '',
        SENTRY_ORG: process.env.SENTRY_ORG ?? '',
        SENTRY_PROJECT: process.env.SENTRY_PROJECT ?? '',
        APP_ENV: process.env.APP_ENV ?? '',
        LOG_LEVEL: process.env.LOG_LEVEL ?? '',
        // I don't remember why I blank these out.
        // It fixes something, maybe with the env name sent to Sentry?
        NEXT_PUBLIC_VERCEL_ENV: '',
        VERCEL_ENV: '',
      }),

      // Moment ships with a large number of locales. Exclude them, leaving
      // just the default English locale. If you need other locales, see:
      // https://create-react-app.dev/docs/troubleshooting/#momentjs-locales-are-missing
      new IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      })
    );

    config.resolve.mainFields = ['module', 'main', 'exports'];

    // Add extension aliases to support ESM-style imports.
    // https://github.com/vercel/next.js/issues/41961
    // https://github.com/webpack/webpack/issues/13252#issuecomment-1824282100
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.jsx': ['.tsx', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
      '.cjs': ['.cts', '.cjs'],
    };

    /**
     * Configure typescript transpilation with babel.
     * Since migrating our project to ESM, the tsconfig files
     * are outputting ESM code, which doesn't work in Electron / Chromium.
     * Using babel to further transpile the output to CJS.
     * https://webpack.js.org/loaders/babel-loader/
     */
    if (isServer) {
      config.module.rules.push({
        test: /\.(?:ts|tsx|js|jsx|mjs|cjs)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: ['maintained node versions'],
                },
              ],
              [
                '@babel/preset-typescript',
                {
                  isTSX: true,
                  allExtensions: true,
                  onlyRemoveTypeImports: true,
                },
              ],
            ],
          },
        },
      });
    } else {
      config.module.rules.push({
        test: /\.(?:ts|tsx|js|jsx|mjs|cjs)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: ['last 1 electron version'],
                },
              ],
              [
                '@babel/preset-typescript',
                {
                  isTSX: true,
                  allExtensions: true,
                  onlyRemoveTypeImports: true,
                },
              ],
            ],
          },
        },
      });
    }

    return config;
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  release: {
    // e.g. "phoenix@x.y.z-abcdef"
    name: `${process.env.npm_package_name}@${process.env.npm_package_version}-${gitHash}`,
    setCommits: {
      auto: true,
    },
  },

  // Suppresses source map uploading logs during build.
  silent: !process.env.CI,

  // Don't send internal plugin errors and performance data to Sentry.
  telemetry: false,

  // Automatically tree-shake Sentry logger statements to reduce bundle size.
  disableLogger: true,

  // Upload a larger set of source maps for prettier stack traces (increases build time).
  widenClientFileUpload: true,

  sourcemaps: {
    // Reduce client bundle size by excluding source maps after upload.
    deleteSourcemapsAfterUpload: true,
  },
});
