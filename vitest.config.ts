// eslint-disable-next-line import/no-unresolved
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    silent: true,
    logHeapUsage: true,
    coverage: {
      exclude: ['**/types.ts', '**/__mocks__/**', '**/__tests__/**'],
    },
  },
});
