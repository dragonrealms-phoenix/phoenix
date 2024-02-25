import type tls from 'node:tls';
import type { Maybe } from '../../../common/types.js';
import { logger } from '../logger.js';
import type { SGECharacter } from '../types.js';
import { listAvailableCharacters } from './list-available-characters.js';

/**
 * Get the character id which is needed to get game play credentials.
 */
export const getCharacterId = async (options: {
  socket: tls.TLSSocket;
  characterName: string;
}): Promise<Maybe<string>> => {
  const { socket, characterName } = options;

  logger.debug('getting character id', { characterName });

  const characters = await listAvailableCharacters({ socket });

  const character = characters.find((character: SGECharacter): boolean => {
    return character.name === characterName;
  });

  logger.debug('got character id', {
    characterName,
    characterId: character?.id ?? null,
  });

  return character?.id;
};
