import electronMainLogger from 'electron-log/main.js';
import { initializeLogging as commonInitializeLogging } from '../../common/logger/initialize-logging.js';

export const initializeLogging = (): void => {
  electronMainLogger.logId = 'main';

  commonInitializeLogging(electronMainLogger);

  // This step can only be done from the main process.
  // It enables the logger to be usable in the renderer process.
  electronMainLogger.initialize({ preload: true });

  // Catch and log unhandled exceptions, such as promise rejections.
  electronMainLogger.errorHandler.startCatching();
};
