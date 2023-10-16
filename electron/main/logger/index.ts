import electronLog from 'electron-log/main';
import { Logger } from '../../common/logger/logger.types';
import { initializeLogging as _initializeLogging } from '../../common/logger/logger.utils';

export function initializeLogging(): void {
  // Continue with common logger initialization.
  _initializeLogging(electronLog);

  // This step can only be done from the main process.
  // It enables the logger to be usable in the renderer process.
  electronLog.initialize({ preload: true });

  // Catch and log unhandled exceptions, such as promise rejections.
  electronLog.errorHandler.startCatching();
}

export function createLogger(scope?: string): Logger {
  return scope ? electronLog.scope(scope) : electronLog;
}
