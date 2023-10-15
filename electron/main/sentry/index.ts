import * as SentryElectron from '@sentry/electron/main';

export function initializeSentry(): void {
  SentryElectron.init({
    dsn: process.env.SENTRY_DSN,

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1,

    // Maximum number of levels JSON logging will traverse in objects and arrays.
    normalizeDepth: 5,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
  });
}
