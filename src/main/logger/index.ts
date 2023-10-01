import electronLog from 'electron-log/main';
import { Logger } from '../../common/logger/logger.types';
import { initializeLogging } from '../../common/logger/logger.utils';

// This step can only be done from the main process.
// It enables the logger to be usable in the renderer process.
electronLog.initialize({ preload: true });

// Continue with common logger initialization.
initializeLogging(electronLog);

export function createLogger(scope?: string): Logger {
  return scope ? electronLog.scope(scope) : electronLog;
}
