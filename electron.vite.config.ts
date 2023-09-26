import { resolve } from 'node:path';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig, externalizeDepsPlugin, swcPlugin } from 'electron-vite';
import { PluginOption } from 'vite';

const sentryPlugin = sentryVitePlugin({
  org: 'dragonrealms-phoenix',
  project: 'phoenix',
  telemetry: false,
});

const mainPlugins: PluginOption[] = [
  externalizeDepsPlugin(),
  swcPlugin(),
  sentryPlugin,
];

const rendererPlugins: PluginOption[] = [react(), sentryPlugin];

export default defineConfig({
  main: {
    plugins: mainPlugins,
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
    plugins: rendererPlugins,
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
