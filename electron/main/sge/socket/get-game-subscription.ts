import type * as tls from 'node:tls';
import { sendAndReceive } from '../../tls/send-and-receive.js';
import { logger } from '../logger.js';
import type { SGEGameCode, SGEGameSubscription } from '../types.js';

/**
 * Get the account's subscription status with the game.
 */
export const getGameSubscription = async (options: {
  socket: tls.TLSSocket;
  gameCode: SGEGameCode;
}): Promise<SGEGameSubscription> => {
  const { socket, gameCode } = options;

  logger.debug('getting game subscription', { gameCode });

  /**
   * Send game code:
   *  'G\t{game_code}'
   *
   * A succesful response has the format:
   *  'G\t{game_name}\t{subscription_status}\t...'
   *
   * An unsuccessful response (e.g. invalid game code) has the format:
   *  'X\tPROBLEM'
   */
  const response = (
    await sendAndReceive({
      socket,
      payload: Buffer.from(`G\t${gameCode}`),
    })
  ).toString();

  if (isProblemResponse(response)) {
    logger.error('problem with game subscription', { gameCode });
    throw new Error(`[SGE:LOGIN:ERROR:SUBSCRIPTION] ${gameCode}`);
  }

  const [gameName, status] = response.split('\t').slice(1);

  const subscription: SGEGameSubscription = {
    game: {
      name: gameName,
      code: gameCode,
    },
    status,
  };

  logger.debug('got game subscription', { subscription });

  return subscription;
};

/**
 * Heuristic to check if the SGE response indicates a problem.
 * Matches the format `{letter}\tPROBLEM`.
 * Examples: `A\tPROBLEM` or `X\tPROBLEM`.
 */
const isProblemResponse = (text: string): boolean => {
  const [_, problem] = text.split('\t');
  return problem === 'PROBLEM';
};
