import type { AccountService } from '../../account/types.js';
import { logger } from '../logger.js';
import type { IpcInvokeHandler } from '../types.js';

export const removeCharacterHandler = (options: {
  accountService: AccountService;
}): IpcInvokeHandler<'removeCharacter'> => {
  const { accountService } = options;

  return async (args): Promise<void> => {
    const { gameCode, accountName, characterName } = args[0];

    logger.debug('removeCharacterHandler', {
      accountName,
      characterName,
      gameCode,
    });

    await accountService.removeCharacter({
      accountName,
      characterName,
      gameCode,
    });
  };
};
