import electronLog from 'electron-log/renderer';
import { Logger } from '../../../common/logger/logger.types';
import { initializeLogging } from '../../../common/logger/logger.utils';

initializeLogging(electronLog);

export function createLogger(scope?: string): Logger {
  return scope ? electronLog.scope(scope) : electronLog;
}
