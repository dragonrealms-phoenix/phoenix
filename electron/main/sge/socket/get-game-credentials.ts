import type tls from 'node:tls';
import first from 'lodash-es/first.js';
import type { Maybe } from '../../../common/types.js';
import { sendAndReceive } from '../../tls/send-and-receive.js';
import { logger } from '../logger.js';
import type { SGEGameCredentials } from '../types.js';
import { SGEGameProtocol } from '../types.js';
import { getCharacterId } from './get-character-id.js';

/**
 * Select character to play and get back game play credentials.
 */
export const getGameCredentials = async (options: {
  socket: tls.TLSSocket;
  characterName: string;
}): Promise<SGEGameCredentials> => {
  const { socket, characterName } = options;

  logger.debug('getting game credentials for character', { characterName });

  // Get the character id to play
  const characterId = await getCharacterId({ socket, characterName });

  if (!characterId) {
    logger.error('no character found', { characterName });
    throw new Error(`[SGE:LOGIN:ERROR:CHARACTER_NOT_FOUND] ${characterName}`);
  }

  /**
   * Select character to play and get back game authorization token:
   *  'L\t{character_id}\t{game_protocol}'
   *
   * A successful response has the format:
   *  'L\tOK\tUPPORT=5535\tGAME=STORM\tGAMECODE=DR\tFULLGAMENAME=Wrayth\tGAMEFILE=WRAYTH.EXE\tGAMEHOST=dr.simutronics.net\tGAMEPORT=11024\tKEY={apiKey}'
   *
   * An unsuccessful response has the format:
   *  'L\tPROBLEM\t1'
   */
  const response = (
    await sendAndReceive({
      socket,
      payload: Buffer.from(`L\t${characterId}\t${SGEGameProtocol.STORMFRONT}`),
    })
  ).toString();

  const status = parseStatus(response);

  if (status !== 'OK') {
    logger.error('no game credentials received from login server', {
      characterName,
      characterId,
      status,
    });
    throw new Error(`[SGE:LOGIN:ERROR:SUBSCRIPTION] ${status}`);
  }

  const gameHost = parseGameHost(response);
  const gamePort = parseGamePort(response);
  const gameKey = parseGameKey(response); // sensitive, don't log

  if (!gameHost || !gamePort || !gameKey) {
    logger.error('failed to parse game credentials', {
      characterName,
      characterId,
    });
    throw new Error(
      `[SGE:LOGIN:ERROR:PARSE_GAME_CREDENTIALS] ${characterName}`
    );
  }

  logger.debug('got game credentials', {
    characterName,
    characterId,
    gameHost,
    gamePort,
  });

  return {
    host: gameHost,
    port: gamePort,
    accessToken: gameKey, // secret key used to authenticate to the game server
  };
};

const parseStatus = (text: string): Maybe<string> => {
  return first(text.split('\t').slice(1));
};

const parseGameHost = (text: string): Maybe<string> => {
  // https://regex101.com/r/zzHkPT/1
  const regex = /\tGAMEHOST=(?<host>[^\t]+)\b/;
  const matches = text.match(regex);
  return matches?.groups?.host ?? '';
};

const parseGamePort = (text: string): Maybe<number> => {
  // https://regex101.com/r/uhgJQK/1
  const regex = /\tGAMEPORT=(?<port>[^\t]+)\b/;
  const matches = text.match(regex);
  return Number(matches?.groups?.port);
};

const parseGameKey = (text: string): Maybe<string> => {
  // https://regex101.com/r/WMYAbs/1
  const regex = /\tKEY=(?<key>[^\t]+)\b/;
  const matches = text.match(regex);
  return matches?.groups?.key;
};
