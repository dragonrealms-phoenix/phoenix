import electronLog from 'electron-log/renderer';
import {
  createLogger,
  initializeLogging,
} from '../../common/logger/logger.utils';

initializeLogging(electronLog);

/**
 * Catch and log unhandled exceptions, such as promise rejections.
 * Requires the `window` object, so can only run client-side.
 */
export function startMonitoringUnhandledExceptions(): void {
  electronLog.errorHandler.startCatching();
}

export function stopMonitoringUnhandledExceptions(): void {
  electronLog.errorHandler.stopCatching();
}

export { createLogger };
