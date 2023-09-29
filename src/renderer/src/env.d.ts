/// <reference types="vite/client" />

/**
 * The electron-vite plugin exposes environment variables from .env file
 * to the main, preload, and renderer processes based on prefixes.
 * The default prefixes are `MAIN_VITE_`, `RENDERER_VITE_`, and `PRELOAD_VITE_`.
 *
 * You access the variables in code via `import.meta.env.{key}`.
 * For typescript support, define the keys in this interface.
 *
 * https://electron-vite.org/guide/env-and-mode.html
 */
interface ImportMetaEnv {
  /**
   * MAIN
   */
  readonly MAIN_VITE_SENTRY_DSN: string;
  readonly MAIN_VITE_SENTRY_CRASH_REPORT_DSN: string;
  /**
   * RENDERER
   */
  readonly RENDERER_VITE_SENTRY_DSN: string;
  readonly RENDERER_VITE_SENTRY_CRASH_REPORT_DSN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
