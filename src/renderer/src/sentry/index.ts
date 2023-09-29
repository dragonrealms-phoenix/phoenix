import * as Sentry from '@sentry/electron/renderer';
import { init as reactInit } from '@sentry/react';

export function initializeSentry(): void {
  Sentry.init(
    {
      dsn: import.meta.env.RENDER_VITE_SENTRY_DSN,
      normalizeDepth: 5,
    },
    reactInit
  );
}
