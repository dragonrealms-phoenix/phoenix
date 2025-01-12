import type { LogMessage, Logger } from '../../../common/logger/types.js';
import type { IpcInvokeHandler } from '../types.js';

export const logHandler = (options: {
  logger: Logger;
}): IpcInvokeHandler<'log'> => {
  const { logger } = options;

  return (args): void => {
    const logMessage = args[0] as LogMessage;
    logger.log(logMessage);
  };
};
