import electronLog from 'electron-log/main.js';
import { initializeLogging as _initializeLogging } from '../../common/logger/initialize-logging.js';

export const initializeLogging = (): void => {
  // Continue with common logger initialization.
  _initializeLogging(electronLog);

  // This step can only be done from the main process.
  // It enables the logger to be usable in the renderer process.
  electronLog.initialize({ preload: true });

  // Catch and log unhandled exceptions, such as promise rejections.
  electronLog.errorHandler.startCatching();
};
