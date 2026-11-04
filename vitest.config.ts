// eslint-disable-next-line import/no-unresolved
import { configDefaults, defineConfig } from 'vitest/config';

// Build output holds compiled copies of the source; tests and coverage must skip it.
const buildOutput = [
  'electron/build/**',
  'electron/renderer/.next/**',
  'electron/renderer/out/**',
];

export default defineConfig({
  test: {
    silent: true,
    logHeapUsage: true,
    exclude: [...configDefaults.exclude, ...buildOutput],
    coverage: {
      exclude: [
        ...buildOutput,
        '**/*.d.ts',
        '**/types.ts',
        '**/__mocks__/**',
        '**/__tests__/**',
      ],
    },
  },
});
