import * as SentryElectron from '@sentry/electron/main';

export const initializeSentry = (): void => {
  SentryElectron.init({
    dsn: process.env.SENTRY_DSN,

    /**
     * https://docs.sentry.io/platforms/javascript/guides/electron/profiling/browser-profiling/
     */
    enableRendererProfiling: true,

    /**
     * Adjust this to control the sample rate for profiling.
     * A number between 0.0 and 1.0 (100%).
     */
    tracesSampleRate: 1,

    /**
     * Sets profiling sample rate when @sentry/profiling-node is installed.
     * A number between 0.0 and 1.0 (100%).
     */
    profilesSampleRate: 1,

    /**
     * Maximum number of levels JSON logging will traverse in objects and arrays.
     */
    normalizeDepth: 5,

    /**
     * Setting this option to true will print useful information to the console while you're setting up Sentry.
     */
    debug: false,
  });
};
