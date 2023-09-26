import { resolve } from 'node:path';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig, externalizeDepsPlugin, swcPlugin } from 'electron-vite';

const sentryPlugin = sentryVitePlugin({
  org: 'dragonrealms-phoenix',
  project: 'phoenix',
  telemetry: false,
  disable: process.env.VITE_PLUGIN_SENTRY_ENABLE !== 'true',
});

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), swcPlugin(), sentryPlugin],
    build: {
      sourcemap: true,
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin(), swcPlugin(), sentryPlugin],
    build: {
      sourcemap: true,
    },
  },
  renderer: {
    plugins: [react(), sentryPlugin],
    build: {
      sourcemap: true,
    },
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
      },
    },
  },
});
