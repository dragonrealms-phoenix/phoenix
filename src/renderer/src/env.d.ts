/// <reference types="vite/client" />

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
