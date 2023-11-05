// @ts-check

/**
 * Config based on https://github.com/elastic/next-eui-starter
 */

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { withSentryConfig } = require('@sentry/nextjs');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const dotenv = require('dotenv');
const glob = require('glob');
const { capitalize } = require('lodash');
const { IgnorePlugin, EnvironmentPlugin } = require('webpack');

dotenv.config();

const pathPrefix = '';

const themeConfig = buildThemeConfig();

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

  /**
   * Output the built files to the specified directory.
   */
  distDir: '../build/renderer',

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
    THEME_CONFIG: JSON.stringify(themeConfig),
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
        SENTRY_INGEST_DOMAIN: process.env.SENTRY_INGEST_DOMAIN,
        SENTRY_DSN: process.env.SENTRY_DSN,
        SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
        SENTRY_ORG: process.env.SENTRY_ORG,
        SENTRY_PROJECT: process.env.SENTRY_PROJECT,
        APP_ENV: process.env.APP_ENV,
        LOG_LEVEL: process.env.LOG_LEVEL,
        // I don't remember why I blank these out.
        // It fixes something, maybe with the env name sent to Sentry?
        NEXT_PUBLIC_VERCEL_ENV: '',
        VERCEL_ENV: '',
      }),

      // Copy @elastic/eui theme files
      new CopyWebpackPlugin({
        patterns: buildElasticThemeFileCopyPatterns(),
      }),

      // Copy react-grid-layout theme files
      new CopyWebpackPlugin({
        patterns: buildReactGridThemeFileCopyPatterns(),
      }),

      // Moment ships with a large number of locales. Exclude them, leaving
      // just the default English locale. If you need other locales, see:
      // https://create-react-app.dev/docs/troubleshooting/#momentjs-locales-are-missing
      new IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      })
    );

    if (!config.resolve) {
      config.resolve = {};
    }
    config.resolve.mainFields = ['module', 'main'];

    return config;
  },
};

module.exports = withSentryConfig(
  nextConfig,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    authToken: process.env.SENTRY_AUTH_TOKEN,
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  }
);

/**
 * Find all EUI themes and construct a theme configuration object.
 *
 * The `copyConfig` key is used to configure CopyWebpackPlugin, which
 * copies the default EUI themes into the `public` directory, injecting a
 * hash into the filename so that when EUI is updated, new copies of the
 * themes will be fetched.
 *
 * The `availableThemes` key is used in the app to includes the themes in
 * the app's `<head>` element, and for theme switching.
 */
function buildThemeConfig() {
  const themeFiles = glob.sync(
    path.join(
      __dirname,
      'node_modules',
      '@elastic',
      'eui',
      'dist',
      'eui_theme_*.min.css'
    ),
    {
      // Only / characters are used by this glob implementation.
      // Since Windows uses \ as a path separator then we enable this option
      // in order for us to use glob patterns created from `path.join`.
      // https://github.com/isaacs/node-glob#windows
      windowsPathsNoEscape: true,
    }
  );

  /** @type {import('./electron/renderer/lib/theme').ThemeConfig} */
  const themeConfig = {
    availableThemes: [],
    copyConfig: [],
  };

  for (const themeFile of themeFiles) {
    const basename = path.basename(themeFile, '.min.css');
    const themeId = basename.replace(/^eui_theme_/, '');
    const themeName = capitalize(themeId).replace(/_/g, ' ');
    const publicPath = `themes/${basename}.${hashFile(themeFile)}.min.css`;

    const toPath = path.join(
      __dirname,
      'electron',
      'renderer',
      `public`,
      `themes`,
      `${basename}.${hashFile(themeFile)}.min.css`
    );

    themeConfig.availableThemes.push({
      id: themeId,
      name: themeName,
      publicPath,
    });

    themeConfig.copyConfig.push({
      from: themeFile,
      to: toPath,
    });
  }

  return themeConfig;
}

/**
 * @returns {import('copy-webpack-plugin').ObjectPattern[]}
 */
function buildElasticThemeFileCopyPatterns() {
  return themeConfig.copyConfig;
}

/**
 * @returns {import('copy-webpack-plugin').ObjectPattern[]}
 */
function buildReactGridThemeFileCopyPatterns() {
  // Where to copy assets from.
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  const reactGridLayoutPath = path.join(nodeModulesPath, 'react-grid-layout');
  const reactResizablePath = path.join(nodeModulesPath, 'react-resizable');

  // Where to copy the assets to.
  const publicPath = path.join(__dirname, 'electron', 'renderer', `public`);

  return [
    {
      from: path.join(reactGridLayoutPath, 'css', 'styles.css'),
      to: path.join(publicPath, 'react-grid', `layout.min.css`),
    },
    {
      from: path.join(reactResizablePath, 'css', 'styles.css'),
      to: path.join(publicPath, 'react-grid', 'resizable.min.css'),
    },
  ];
}

/**
 * Given a file, calculate a hash and return the first portion. The number
 * of characters is truncated to match how Webpack generates hashes.
 *
 * @param {string} filePath the absolute path to the file to hash.
 * @return {string}
 */
function hashFile(filePath) {
  const hash = crypto.createHash(`sha256`);
  const fileData = fs.readFileSync(filePath);
  hash.update(fileData);
  const fullHash = hash.digest(`hex`);

  // Use a hash length that matches what Webpack does
  return fullHash.substring(0, 20);
}
