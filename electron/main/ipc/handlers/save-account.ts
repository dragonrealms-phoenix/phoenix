import type { AccountService } from '../../account/types.js';
import { logger } from '../logger.js';
import type { IpcInvokeHandler } from '../types.js';

export const saveAccountHandler = (options: {
  accountService: AccountService;
}): IpcInvokeHandler<'saveAccount'> => {
  const { accountService } = options;

  return async (args): Promise<void> => {
    const { accountName, accountPassword } = args[0];

    logger.debug('saveAccountHandler', { accountName });

    await accountService.saveAccount({
      accountName,
      accountPassword,
    });
  };
};
