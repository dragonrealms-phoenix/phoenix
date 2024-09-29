import * as SentryNextjs from '@sentry/nextjs';
import { initializeLogging } from './lib/logger/initialize-logging.js';

/**
 * Nextjs Instrumentation for monitoring and logging.
 * https://nextjs.org/docs/pages/building-your-application/optimizing/instrumentation
 */
export const register = async (): Promise<void> => {
  registerLogger();
  registerSentry();
};

const registerLogger = (): void => {
  initializeLogging();
};

/**
 * Sentry Config for Next.js
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */
const registerSentry = (): void => {
  SentryNextjs.init({
    /**
     * URL where to send events to Sentry.
     *
     * DSNs are safe to keep public because they only allow submission of new
     * events; they do not allow read access to any information.
     *
     * However, if a bad actor begins spamming your DSN url, you can
     * rotate (and revoke) DSNs by navigating to [Project] > Settings > Client Keys (DSN).
     */
    dsn: process.env.SENTRY_DSN,
    /**
     * Percentage of errors that are sent to Sentry.
     * Range from 0.0 (0%) to 1.0 (100%).
     */
    tracesSampleRate: 1,
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
