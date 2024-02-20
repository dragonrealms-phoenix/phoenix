import electronRendererLogger from 'electron-log/renderer.js';
import { createLogger as commonCreateLogger } from '../../common/logger/create-logger.js';
import { initializeLogging } from '../../common/logger/initialize-logging.js';
import type { Logger } from '../../common/logger/types.js';

initializeLogging(electronRendererLogger);

export const createLogger = (scope?: string): Logger => {
  return commonCreateLogger({
    scope,
    logger: electronRendererLogger,
  });
};

export const logger = createLogger('renderer');

/**
 * Catch and log unhandled exceptions, such as promise rejections.
 * Requires the `window` object, so can only run client-side.
 */
export const startMonitoringUnhandledExceptions = (): void => {
  electronRendererLogger.errorHandler.startCatching();
};

export const stopMonitoringUnhandledExceptions = (): void => {
  electronRendererLogger.errorHandler.stopCatching();
};
