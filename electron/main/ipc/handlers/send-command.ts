import { Game } from '../../game/game.instance.js';
import { logger } from '../logger.js';
import type { IpcDispatcher, IpcInvokeHandler } from '../types.js';

export const sendCommandHandler = (options: {
  dispatch: IpcDispatcher;
}): IpcInvokeHandler<'sendCommand'> => {
  const { dispatch } = options;

  return async (args): Promise<void> => {
    const command = args[0];

    logger.debug('sendCommandHandler', { command });

    const gameInstance = Game.getInstance();

    if (!gameInstance) {
      throw new Error('[IPC:SEND_COMMAND:ERROR:GAME_INSTANCE_NOT_FOUND]');
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
  };
};
