import type { LogMessage, Logger } from '../../../common/logger/types.js';
import type { IpcInvokeHandler } from '../types.js';

export const logHandler = (options: {
  logger: Logger;
}): IpcInvokeHandler<'log'> => {
  const { logger } = options;

  return async (args): Promise<void> => {
    const logMessage = args[0] as LogMessage;
    const { level, message, data, ...rest } = logMessage;

    logger.log({
      level,
      message,
      data: {
        ...rest,
        ...data,
      },
    });
  };
};
