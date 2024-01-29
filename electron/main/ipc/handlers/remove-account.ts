import type { AccountService } from '../../account/types.js';
import { logger } from '../logger.js';
import type { IpcInvokeHandler } from '../types.js';

export const removeAccountHandler = (options: {
  accountService: AccountService;
}): IpcInvokeHandler<'removeAccount'> => {
  const { accountService } = options;

  return async (args): Promise<void> => {
    const { accountName } = args[0];

    logger.debug('removeAccountHandler', { accountName });

    await accountService.removeAccount({ accountName });
  };
};
