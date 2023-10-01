import * as Sentry from '@sentry/electron/main';

export function initializeSentry(): void {
  Sentry.init({
    dsn: import.meta.env.MAIN_VITE_SENTRY_DSN,
    normalizeDepth: 5,
  });
}
