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
    plugins: [react(), sentryPlugin],
    build: {
      sourcemap: true,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            vendor: ['lodash'],
          },
        },
      },
    },
  },
});
