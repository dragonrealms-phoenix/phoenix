import type { GameCode } from '../../../common/game/types.js';
import type { AccountService } from '../../account/types.js';
import { Game } from '../../game/game.instance.js';
import { SGEServiceImpl } from '../../sge/sge.service.js';
import type { SGEGameCode } from '../../sge/types.js';
import { logger } from '../logger.js';
import type { IpcDispatcher, IpcInvokeHandler } from '../types.js';

export const playCharacterHandler = (options: {
  dispatch: IpcDispatcher;
  accountService: AccountService;
}): IpcInvokeHandler<'playCharacter'> => {
  const { dispatch, accountService } = options;

  return async (args): Promise<void> => {
    const { accountName, characterName, gameCode } = args[0];

    logger.debug('playCharacterHandler', {
      accountName,
      characterName,
      gameCode,
    });

    const account = await accountService.getAccount({
      accountName,
    });

    if (!account) {
      throw new Error(
        `[IPC:PLAY_CHARACTER:ERROR:ACCOUNT_NOT_FOUND] ${accountName}`
      );
    }

    const sgeService = new SGEServiceImpl({
      gameCode: gameCode as SGEGameCode,
      username: account.accountName,
      password: account.accountPassword,
    });

    const credentials = await sgeService.loginCharacter(characterName);
    const gameInstance = await Game.newInstance({ credentials });
    const gameEvents$ = await gameInstance.connect();

    dispatch('game:connect', {
      accountName,
      characterName,
      gameCode: gameCode as GameCode,
    });

    logger.debug('subscribing to game service stream');
    gameEvents$.subscribe({
      next: (gameEvent) => {
        logger.trace('game service stream event', { gameEvent });
        dispatch('game:event', { gameEvent });
      },
      error: (error) => {
        logger.error('game service stream error', { error });
        dispatch('game:error', { error });
      },
      complete: () => {
        logger.debug('game service stream completed');
        dispatch('game:disconnect', {
          accountName,
          characterName,
          gameCode: gameCode as GameCode,
        });
      },
    });
  };
};
