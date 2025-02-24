import type { GameCode } from '../../../common/game/types.js';
import type { AccountService } from '../../account/types.js';
import { Game } from '../../game/game.instance.js';
import { startLichProcess } from '../../lich/start-process.js';
import { Preferences } from '../../preference/preference.instance.js';
import { PreferenceKey } from '../../preference/types.js';
import { SGEServiceImpl } from '../../sge/sge.service.js';
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

    const account = accountService.getAccount({
      accountName,
    });

    if (!account) {
      throw new Error(
        `[IPC:PLAY_CHARACTER:ERROR:ACCOUNT_NOT_FOUND] ${accountName}`
      );
    }

    const sgeService = new SGEServiceImpl({
      gameCode: gameCode,
      username: account.accountName,
      password: account.accountPassword,
    });

    const credentials = await sgeService.loginCharacter(characterName);

    if (Preferences.get(PreferenceKey.LICH_ENABLED)) {
      const { host, port } = await startLichProcess({
        gameCode: gameCode as GameCode,
      });
      credentials.host = host;
      credentials.port = port;
    }

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
