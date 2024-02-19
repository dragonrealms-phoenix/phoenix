import type tls from 'node:tls';
import { sendAndReceive } from '../../tls/send-and-receive.js';
import { logger } from '../logger.js';
import type { SGECharacter } from '../types.js';

/**
 * Get list of the account's available characters.
 */
export const listAvailableCharacters = async (options: {
  socket: tls.TLSSocket;
}): Promise<Array<SGECharacter>> => {
  const { socket } = options;

  logger.debug('listing available characters');

  /**
   * Get list of the account's available character names and ids.
   * The first four tab-delimited numbers are unknown and vary, but there are 4.
   * After that begin the tab-delimited character id and name pairs.
   *  'C\t1\t1\t0\t0\t{character_id_1}\t{character_name_1}\t{character_id_2}\t{character_name_2}\t...'
   */
  const response = (
    await sendAndReceive({
      socket,
      payload: Buffer.from(`C`),
    })
  ).toString();

  const characters = new Array<SGECharacter>();

  const pairs = response.split('\t').slice(5);
  for (let i = 0; i < pairs.length - 1; i += 2) {
    const id = pairs[i];
    const name = pairs[i + 1];

    characters.push({
      id,
      name,
    });
  }

  logger.debug('available characters', { characters });

  return characters;
};
