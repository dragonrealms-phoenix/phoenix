import type { AccountService } from '../../account/types.js';
import { logger } from '../logger.js';
import type { IpcInvokeHandler, IpcSgeAccount } from '../types.js';

export const listAccountsHandler = (options: {
  accountService: AccountService;
}): IpcInvokeHandler<'listAccounts'> => {
  const { accountService } = options;

  return async (_args): Promise<Array<IpcSgeAccount>> => {
    logger.debug('listAccountsHandler');

    return accountService.listAccounts();
  };
};
