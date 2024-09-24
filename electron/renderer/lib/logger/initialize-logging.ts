import electronRendererLogger from 'electron-log/renderer.js';
import { initializeLogging as commonInitializeLogging } from '../../../common/logger/initialize-logging.js';

export const initializeLogging = (): void => {
  electronRendererLogger.logId = 'renderer';

  commonInitializeLogging(electronRendererLogger);
};
