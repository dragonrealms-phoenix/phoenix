import * as Sentry from '@sentry/electron/main';
import electronLog from 'electron-log/main';
import { Logger } from '../../common/logger/logger.types';
import { initializeLogging } from '../../common/logger/logger.utils';

initializeLogging(electronLog);

export function createLogger(scope?: string): Logger {
  return scope ? electronLog.scope(scope) : electronLog;
}

// TOOD move to a sentry init file
Sentry.init({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  dsn: import.meta.env.MAIN_VITE_SENTRY_DSN,
  normalizeDepth: 5,
});
