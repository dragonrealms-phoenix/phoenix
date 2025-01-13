import { ScopedLoggerImpl } from '../../../common/logger/scoped.logger.js';
import type { Logger } from '../../../common/logger/types.js';
import { IpcLoggerImpl } from './ipc.logger.js';

let defaultLogger: Logger;

const scopedLoggers: Record<string, Logger> = {};

/**
 * Creates and caches a logger with the specific scope for all messages.
 * You can overwrite the scope on a per-message basis by passing `scope`
 * to the `data` argument of any of the log functions.
 */
export const getScopedLogger = (scope: string): Logger => {
  const cachedLogger = scopedLoggers[scope];

  if (cachedLogger) {
    return cachedLogger;
  }

  if (!defaultLogger) {
    defaultLogger = new IpcLoggerImpl();
  }

  const scopedLogger = new ScopedLoggerImpl({
    scope,
    delegate: defaultLogger,
  });

  scopedLoggers[scope] = scopedLogger;

  return scopedLogger;
};
