// Sentry Config for Next.js
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as SentryElectron from '@sentry/electron/renderer';
import * as SentryNextjs from '@sentry/nextjs';

SentryElectron.init<
  SentryElectron.BrowserOptions & SentryNextjs.BrowserOptions
>(
  {
    /**
     * List of integrations that should be installed after SDK was initialized.
     * Accepts either a list of integrations or a function that receives
     * default integrations and returns a new, updated list.
     * https://docs.sentry.io/platforms/javascript/guides/electron/configuration/integrations/
     */
    integrations: (integrations: Array<any>) => {
      return [
        ...integrations,
        SentryElectron.browserTracingIntegration(),
        SentryElectron.browserProfilingIntegration(),
        SentryElectron.browserSessionIntegration(),
      ];
    },

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
  },
  SentryNextjs.init
);
