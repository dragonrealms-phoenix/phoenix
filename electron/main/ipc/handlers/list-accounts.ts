import type { Account } from '../../../common/account/types.js';
import type { AccountService } from '../../account/types.js';
import { logger } from '../logger.js';
import type { IpcInvokeHandler } from '../types.js';

export const listAccountsHandler = (options: {
  accountService: AccountService;
}): IpcInvokeHandler<'listAccounts'> => {
  const { accountService } = options;

  return async (_args): Promise<Array<Account>> => {
    logger.debug('listAccountsHandler');

    return accountService.listAccounts();
  };
};
