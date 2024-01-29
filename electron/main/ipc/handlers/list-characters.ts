import type { AccountService } from '../../account/types.js';
import { logger } from '../logger.js';
import type { IpcInvokeHandler, IpcSgeCharacter } from '../types.js';

export const listCharactersHandler = (options: {
  accountService: AccountService;
}): IpcInvokeHandler<'listCharacters'> => {
  const { accountService } = options;

  return async (_args): Promise<Array<IpcSgeCharacter>> => {
    logger.debug('listCharactersHandler');

    return accountService.listCharacters();
  };
};
