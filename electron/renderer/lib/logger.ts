import electronLog from 'electron-log/renderer.js';
import { createLogger } from '../../common/logger/create-logger.js';
import { initializeLogging } from '../../common/logger/initialize-logging.js';

initializeLogging(electronLog);

export const logger = await createLogger('renderer');

/**
 * Catch and log unhandled exceptions, such as promise rejections.
 * Requires the `window` object, so can only run client-side.
 */
export const startMonitoringUnhandledExceptions = (): void => {
  electronLog.errorHandler.startCatching();
};

export const stopMonitoringUnhandledExceptions = (): void => {
  electronLog.errorHandler.stopCatching();
};
