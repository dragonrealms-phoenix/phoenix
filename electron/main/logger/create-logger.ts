import electronMainLogger from 'electron-log/main.js';
import { createLogger as commonCreateLogger } from '../../common/logger/create-logger.js';
import type { Logger } from '../../common/logger/types.js';

export const createLogger = (scope?: string): Logger => {
  return commonCreateLogger({
    scope,
    logger: electronMainLogger,
  });
};
