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

    if (!gameInstance) {
      throw new Error('[IPC:QUIT_CHARACTER:ERROR:GAME_INSTANCE_NOT_FOUND]');
    }

    if (!gameInstance.isConnected()) {
      logger.info('game instance not connected, skipping send command', {
        command,
      });
      return;
    }

    // Let the world know we are sending a command.
    dispatch('game:command', { command });

    gameInstance.send(command);

    // Give the service and the game some time to process the command.
    await sleep(1000);

    // Normally, the game server will disconnect the client after this command.
    // Just in case, explicitly disconnect ourselves.
    await gameInstance.disconnect();
  };
};
