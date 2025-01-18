import { getScopedLogger } from './logger.factory.js';

/**
 * Catch and log unhandled exceptions, such as promise rejections.
 * Requires the `window` object, so can only run client-side.
 */
export const startMonitoringUnhandledExceptions = (): void => {
  window.addEventListener('error', errorEventHandler);
  window.addEventListener('unhandledrejection', rejectionEventHandler);
};

export const stopMonitoringUnhandledExceptions = (): void => {
  window.removeEventListener('error', errorEventHandler);
  window.removeEventListener('unhandledrejection', rejectionEventHandler);
};

const errorEventHandler = (event: ErrorEvent) => {
  event.preventDefault();
  logError({
    message: `[RENDERER:WINDOW:ERROR] ${event.message}`,
    data: {
      error: event.error,
    },
  });
};

const rejectionEventHandler = (event: PromiseRejectionEvent) => {
  event.preventDefault();
  logError({
    message: '[RENDERER:WINDOW:UNHANDLED_REJECTION]',
    data: {
      reason: event.reason,
    },
  });
};

const logError = (options: {
  message: string;
  data?: Record<string, unknown>;
}): void => {
  const { message, data } = options;

  const logger = getScopedLogger('renderer:error:monitor');

  logger.error(message, data);
};
