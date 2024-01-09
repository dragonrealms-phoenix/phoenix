import type { Maybe } from '../../common/types';
import { createLogger } from '../logger';
import type { SGEGameCredentials } from '../sge';
import { GameServiceImpl } from './game.service';
import type { GameService } from './game.types';

const logger = createLogger('game:instance');

// There is exactly one game instance at a time,
// and it can be playing at most one character.
let gameInstance: Maybe<GameService>;

export const Game = {
  /**
   * There is exactly one game instance at a time,
   * and it can be playing at most one character.
   *
   * To play a different character then
   * a new game instance must be created.
   *
   * Creating a new game instance will disconnect the existing one.
   *
   * Use the `getInstance` method to get a refence to the current game instance.
   */
  newInstance: async (options: {
    credentials: SGEGameCredentials;
  }): Promise<GameService> => {
    const { credentials } = options;
    if (gameInstance) {
      logger.info('disconnecting from existing game instance');
      await gameInstance.disconnect();
    }
    logger.info('creating new game instance');
    gameInstance = new GameServiceImpl({ credentials });
    return gameInstance;
  },

  /**
   * A reference to the current game instance.
   * Returns undefined if the `newInstance` method has not yet been called.
   */
  getInstance: (): Maybe<GameService> => {
    return gameInstance;
  },
};
