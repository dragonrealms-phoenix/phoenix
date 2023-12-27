import { type AccountService, AccountServiceImpl } from '../account';
import { Store } from '../store';
import type { Dispatcher } from '../types';
import { IpcController } from './ipc.controller';

/**
 * I didn't like the app nor controller needing to know about
 * the account service implementation so I created this util
 * to abstract that concern. For testing, or if we ever need to
 * specify the account service implementation, we can still
 * use this method or use the IpController constructor directly.
 */
export function newIpcController(options: {
  dispatch: Dispatcher;
  accountService?: AccountService;
}): IpcController {
  const {
    dispatch,
    accountService = new AccountServiceImpl({
      storeService: Store.getInstance(),
    }),
  } = options;

  return new IpcController({
    dispatch,
    accountService,
  });
}
