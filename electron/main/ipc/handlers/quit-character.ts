import { sleep } from '../../../common/async/sleep.js';
import { Game } from '../../game/game.instance.js';
import { logger } from '../logger.js';
import type { IpcDispatcher, IpcInvokeHandler } from '../types.js';

export const quitCharacterHandler = (options: {
  dispatch: IpcDispatcher;
}): IpcInvokeHandler<'quitCharacter'> => {
  const { dispatch } = options;

  const command = 'quit';

  return async (): Promise<void> => {
    logger.debug('quitCharacterHandler', { command });

    const gameInstance = Game.getInstance();

    if (gameInstance) {
      dispatch('game:command', { command });
      gameInstance.send(command);
      await sleep(1000);
      await gameInstance.disconnect();
    } else {
      throw new Error('[IPC:QUIT_CHARACTER:ERROR:GAME_INSTANCE_NOT_FOUND]');
    }
  };
};
