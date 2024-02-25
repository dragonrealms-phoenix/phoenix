import type { AccountService } from '../../account/types.js';
import { logger } from '../logger.js';
import type { IpcInvokeHandler } from '../types.js';

export const saveCharacterHandler = (options: {
  accountService: AccountService;
}): IpcInvokeHandler<'saveCharacter'> => {
  const { accountService } = options;

  return async (args): Promise<void> => {
    const { gameCode, accountName, characterName } = args[0];

    logger.debug('saveCharacterHandler', {
      accountName,
      characterName,
      gameCode,
    });

    await accountService.saveCharacter({
      accountName,
      characterName,
      gameCode,
    });
  };
};
