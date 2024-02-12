import type * as tls from 'node:tls';
import { sendAndReceive } from '../../tls/send-and-receive.js';
import { logger } from '../logger.js';
import type { SGEGame, SGEGameCode } from '../types.js';

/**
 * Identify the games that are available to the account.
 */
export const listAvailableGames = async (options: {
  socket: tls.TLSSocket;
}): Promise<Array<SGEGame>> => {
  const { socket } = options;

  logger.debug('listing available games');

  /**
   * Get list of available games:
   *  'M'
   *
   * A succesful response has the format:
   *  'M\t{game_code_1}\t{game_name_1}\t{game_code_2}\t{game_name_2}\t...'
   */
  const response = (
    await sendAndReceive({
      socket,
      payload: Buffer.from(`M`),
    })
  ).toString();

  const games = new Array<SGEGame>();
  const gamePairs = response.split('\t').slice(1);

  for (let i = 0; i < gamePairs.length - 1; i += 2) {
    const gameCode = gamePairs[i];
    const gameName = gamePairs[i + 1];
    games.push({
      code: gameCode as SGEGameCode,
      name: gameName,
    });
  }

  logger.debug('available games', { games });

  return games;
};
