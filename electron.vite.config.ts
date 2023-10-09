import 'dotenv/config';
import { execSync } from 'child_process';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import {
  defineConfig,
  externalizeDepsPlugin,
  splitVendorChunkPlugin,
  swcPlugin,
} from 'electron-vite';
import { type PluginOption } from 'vite';

const sentryPlugin = sentryVitePlugin({
  org: 'dragonrealms-phoenix',
  project: 'phoenix',
  telemetry: false,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  disable: process.env.VITE_PLUGIN_SENTRY_ENABLE !== 'true',
}) as PluginOption;

const gitHashPlugin = (): PluginOption => {
  return {
    name: 'git-hash-plugin',
    config: () => {
      return {
        define: {
          'import.meta.env.MAIN_VITE_GIT_SHORT_HASH': JSON.stringify(
            execSync('git rev-parse --short HEAD').toString().trim()
          ),
          'import.meta.env.MAIN_VITE_GIT_LONG_HASH': JSON.stringify(
            execSync('git rev-parse HEAD').toString().trim()
          ),
        },
      };
    },
  };
};

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin(),
      swcPlugin(),
      gitHashPlugin(),
      sentryPlugin,
    ],
    build: {
      sourcemap: true,
      minify: 'esbuild',
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin(), swcPlugin(), sentryPlugin],
    build: {
      sourcemap: true,
      minify: 'esbuild',
    },
  },
  renderer: {
    plugins: [react(), splitVendorChunkPlugin(), sentryPlugin],
    build: {
      sourcemap: true,
      minify: 'esbuild',
    },
  },
});
