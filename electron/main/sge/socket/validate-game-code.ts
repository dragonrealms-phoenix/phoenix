import type * as tls from 'node:tls';
import { logger } from '../logger.js';
import type { SGEGame, SGEGameCode } from '../types.js';
import { listAvailableGames } from './list-available-games.js';

/**
 * Validate that the account has access to the game to play.
 * If the game code is invalid then the rest of the login process will fail.
 */
export const validateGameCode = async (options: {
  socket: tls.TLSSocket;
  gameCode: SGEGameCode;
}): Promise<void> => {
  const { socket, gameCode } = options;

  logger.debug('validating game code', { gameCode });

  const availableGames = await listAvailableGames({ socket });
  const availableGameCodes = availableGames.map(
    (game: SGEGame): SGEGameCode => {
      return game.code;
    }
  );

  if (!availableGameCodes.includes(gameCode)) {
    logger.error('game is not available to account', {
      gameCode,
      availableGames,
    });
    throw new Error(`[SGE:LOGIN:ERROR:GAME_NOT_FOUND] ${gameCode}`);
  }

  logger.debug('game code is valid', { gameCode });
};
