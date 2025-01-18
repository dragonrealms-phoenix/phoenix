import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import pluginJavaScript from '@eslint/js';
import pluginTypeScript from '@typescript-eslint/eslint-plugin';
import pluginTypeScriptParser from '@typescript-eslint/parser';
import pluginImport from 'eslint-plugin-import';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginRxjs from 'eslint-plugin-rxjs';
import pluginUnusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: pluginJavaScript.configs.recommended,
  allConfig: pluginJavaScript.configs.all,
});

/**
 * @type {Array<import('eslint').Linter.Config>}
 */
export default [
  {
    ignores: [
      'eslint.config.js', // ignore self
      '.yarn/*',
      'node_modules',
      'coverage',
      'electron/build',
      'electron/renderer/.next',
      'electron/renderer/public',
      'build',
      'dist',
      '**/.DS_Store',
      '**/*.pem',
      '**/npm-debug.log*',
      '**/yarn-debug.log*',
      '**/yarn-error.log*',
      '**/.env*.local',
      '**/*.tsbuildinfo',
      '**/*.d.ts',
    ],
  },
  ...fixupConfigRules(
    compat.extends(
      'eslint:recommended',
      'plugin:@next/next/recommended',
      'plugin:import/recommended',
      'plugin:prettier/recommended'
    )
  ),
  {
    files: ['**/*.js', '**/*.ts', '**/*.tsx'],
    plugins: {
      'import': fixupPluginRules(pluginImport),
      'prettier': fixupPluginRules(pluginPrettier),
      'unused-imports': fixupPluginRules(pluginUnusedImports),
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    settings: {
      react: {
        version: 'detect',
      },
      next: {
        rootDir: 'electron/renderer/',
      },
    },
    rules: {
      'no-else-return': 'warn',
      'no-plusplus': 'warn',
      'curly': 'error',
      'prefer-arrow-callback': 'error',
      'sort-imports': [
        'error',
        {
          ignoreCase: false,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
          allowSeparatedGroups: true,
        },
      ],
      'import/default': 'off',
      'import/no-commonjs': 'error',
      'import/no-unresolved': 'error',
      'import/order': [
        'error',
        {
          'newlines-between': 'never',

          'alphabetize': {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'unused-imports/no-unused-imports': 'error',
    },
  },
  ...fixupConfigRules(
    compat.extends(
      'eslint:recommended',
      'plugin:@next/next/recommended',
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:import/recommended',
      'plugin:import/electron',
      'plugin:import/typescript',
      'plugin:prettier/recommended',
      'plugin:react/recommended',
      'plugin:react/jsx-runtime',
      'plugin:react-hooks/recommended',
      'plugin:rxjs/recommended'
    )
  ).map((config) => ({
    ...config,
    files: ['electron/**/*.ts', 'electron/**/*.tsx'],
  })),
  {
    files: ['electron/**/*.ts', 'electron/**/*.tsx'],
    plugins: {
      '@typescript-eslint': fixupPluginRules(pluginTypeScript),
      'import': fixupPluginRules(pluginImport),
      'prettier': fixupPluginRules(pluginPrettier),
      'react': fixupPluginRules(pluginReact),
      'react-hooks': fixupPluginRules(pluginReactHooks),
      'rxjs': fixupPluginRules(pluginRxjs),
      'unused-imports': fixupPluginRules(pluginUnusedImports),
    },
    languageOptions: {
      parser: pluginTypeScriptParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        project: 'tsconfig.eslint.json',
      },
    },
    settings: {
      'react': {
        version: 'detect',
      },
      'next': {
        rootDir: 'electron/renderer/',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: 'electron/*/tsconfig.json',
        },
      },
    },
    rules: {
      '@typescript-eslint/array-type': [
        'warn',
        {
          default: 'generic',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'off',
        {
          allowTypedFunctionExpressions: false,
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': [
        'error',
        {
          allowArgumentsExplicitlyTypedAsAny: true,
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          disallowTypeAnnotations: false,
        },
      ],
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'import/default': 'off',
      'import/namespace': 'off',
      'react/no-unknown-property': [
        'error',
        {
          ignore: ['css'],
        },
      ],
      'react/display-name': [
        'error',
        {
          ignoreTranspilerName: false,
          checkContextObjects: true,
        },
      ],
      'rxjs/no-implicit-any-catch': 'off',
    },
  },
  {
    files: ['electron/common/**/*.ts'],
    ignores: [
      'electron/common/**/__tests__/*.ts',
      'electron/common/**/__mocks__/*.ts',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'node:*',
                'buffer',
                'console',
                'crypto',
                'events',
                'fs',
                'http',
                'https',
                'net',
                'os',
                'path',
                'process',
                'stream',
                'tls',
                'url',
                'util',
              ],
              message: 'common package is used in non-node environments',
            },
          ],
        },
      ],
      'no-restricted-globals': [
        'error',
        {
          name: '__dirname',
          message: 'common package is used in non-node environments',
        },
        {
          name: '__filename',
          message: 'common package is used in non-node environments',
        },
        {
          name: 'Buffer',
          message: 'common package is used in non-node environments',
        },
        {
          name: 'process',
          message:
            'common package is used in non-node environments, only process.env is allowed',
        },
      ],
    },
  },
  {
    files: ['electron/**/__tests__/*.ts', 'electron/**/__mocks__/*.ts'],
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          disallowTypeAnnotations: false,
        },
      ],
    },
  },
];
