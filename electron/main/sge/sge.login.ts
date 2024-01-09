import tls from 'node:tls';
import { first, last, merge } from 'lodash';
import type { Maybe } from '../../common/types';
import { createLogger } from '../logger';
import {
  createSelfSignedCertConnectOptions,
  downloadCertificate,
  sendAndReceive,
} from '../tls';
import type {
  SGECharacter,
  SGEGame,
  SGEGameCode,
  SGEGameCredentials,
  SGEGameSubscription,
  SGELoginResponse,
} from './sge.types';
import { SGEGameProtocol } from './sge.types';
import { hashPassword, isProblemResponse } from './sge.utils';

const logger = createLogger('sge:login');

// As of November 2023, the login server's self-signed certificate
// is valid until Nov 16, 3017. We'll cache it in memory for performance.
let cachedTlsCertificate: Maybe<tls.PeerCertificate>;

/**
 * SGE stands for Simutronics Game Entry
 * https://www.play.net/dr/play/sge-info.asp
 *
 * This module handles exchanging play.net credentials
 * for a DragonRealms instance session key.
 * https://elanthipedia.play.net/SGE_protocol_(saved_post)
 * https://github.com/WarlockFE/warlock2/wiki/EAccess-Protocol
 */
export async function loginCharacter(options: {
  /**
   * Play.net account name
   */
  username: string;
  /**
   * Play.net account password
   */
  password: string;
  /**
   * Character name to log in to the game as.
   */
  characterName: string;
  /**
   * Which instance of the game to log in to.
   */
  gameCode: SGEGameCode;
  /**
   * Any additional options to use when making the socket connection.
   */
  connectOptions?: tls.ConnectionOptions;
}): Promise<SGELoginResponse> {
  const { username, password, characterName, gameCode } = options;

  logger.debug('logging in', { username, characterName, gameCode });

  // Connect to login server
  const socket = await connect(options.connectOptions);

  try {
    // Authenticate to login server
    await authenticate({
      socket,
      username,
      password,
    });

    // Confirm account has access to the game they want to play
    await validateGameCode({ socket, gameCode });

    // Get account's subscription status to play the game
    const subscription = await getGameSubscription({ socket, gameCode });

    // Select character to play and get back game credentials
    const credentials = await getGameCredentials({ socket, characterName });

    return {
      subscription,
      credentials,
    };
  } catch (error) {
    logger.error('error logging in', { error });
    throw error;
  } finally {
    socket.destroySoon();
  }
}

/**
 * List the characters available to the account.
 */
export async function listCharacters(options: {
  /**
   * Play.net account name
   */
  username: string;
  /**
   * Play.net account password
   */
  password: string;
  /**
   * Which instance of the game to log in to.
   */
  gameCode: SGEGameCode;
  /**
   * Any additional options to use when making the socket connection.
   */
  connectOptions?: tls.ConnectionOptions;
}): Promise<Array<SGECharacter>> {
  const { username, password, gameCode } = options;

  // Connect to login server
  const socket = await connect(options.connectOptions);

  try {
    // Authenticate to login server
    await authenticate({
      socket,
      username,
      password,
    });

    // Confirm account has access to the game they want to play
    await validateGameCode({ socket, gameCode });

    // Confirm account's subscription status to play the game
    // We don't need this, but the SGE protocol requires us to do it
    // before we can list the characters available to the account
    await getGameSubscription({ socket, gameCode });

    // Retrieve list of characters available to the account
    const characters = await listAvailableCharacters({ socket });

    return characters;
  } catch (error) {
    logger.error('error listing characters', { error });
    throw error;
  } finally {
    socket.destroySoon();
  }
}

/**
 * Simutronics uses a self-signed certificate.
 * This method downloads that certificate then creates
 * a new socket connection trusting that certificate and
 * proactively validating the server's certificate.
 */
async function connect(
  connectOptions?: tls.ConnectionOptions
): Promise<tls.TLSSocket> {
  const defaultOptions: tls.ConnectionOptions = {
    host: 'eaccess.play.net',
    port: 7910,
  };

  let mergedOptions = merge(defaultOptions, connectOptions);

  const { host, port } = mergedOptions;

  const certToTrust = await getTrustedTlsCertificate(mergedOptions);

  mergedOptions = merge(
    mergedOptions,
    createSelfSignedCertConnectOptions({
      certToTrust,
    })
  );

  logger.debug('connecting to login server', { host, port });
  const socket = tls.connect(mergedOptions, (): void => {
    logger.debug('connected to login server', { host, port });
  });

  socket.on('end', (): void => {
    logger.debug('connection to login server ended', { host, port });
  });

  socket.on('close', (): void => {
    logger.debug('connection to login server closed', { host, port });
  });

  socket.on('timeout', (): void => {
    const timeout = socket.timeout;
    logger.error('login server inactivity timeout', { host, port, timeout });
  });

  socket.on('error', (error: Error): void => {
    logger.error('login server error', { host, port, error });
  });

  return socket;
}

/**
 * Gets the play.net login server's self-signed certificate.
 * Use this anytime we connect to the SGE server to get or send customer data.
 */
async function getTrustedTlsCertificate(
  connectOptions: tls.ConnectionOptions
): Promise<tls.PeerCertificate> {
  const { host, port } = connectOptions;

  if (cachedTlsCertificate) {
    logger.debug('using cached login server certificate', { host, port });
    return cachedTlsCertificate;
  }

  logger.debug('downloading login server certificate', { host, port });
  cachedTlsCertificate = await downloadCertificate(connectOptions);

  return cachedTlsCertificate;
}

/**
 * Authenticate to login server.
 */
async function authenticate(options: {
  socket: tls.TLSSocket;
  username: string;
  password: string;
}): Promise<void> {
  const { socket, username, password } = options;

  logger.debug('authenticating', { username });

  // Request salt for hashing the account password
  const hashSalt = await getPasswordHashSalt({ socket });

  // Hash the password to protect it over the wire
  const hashedPassword = hashPassword({ password, hashSalt });

  /**
   * Send account username and hashed password:
   *  'A\t{username}\t{hashed_password}'
   *
   * A succesful response has the format:
   *  'A\t{username}\tKEY\t{key}\t...'
   *
   * An unsuccessful response has the format:
   *  'A\t\tPASSWORD', 'A\t\tNORECORD' or '?'
   */
  const response = (
    await sendAndReceive({
      socket,
      payload: Buffer.concat([
        Buffer.from(`A\t${username.toUpperCase()}\t`),
        hashedPassword,
      ]),
    })
  ).toString();

  const parseAuthError = (text: string): string => {
    if (text.startsWith('A')) {
      return last(text.split('\t')) as string;
    }
    return text;
  };

  if (!response.includes('\tKEY\t')) {
    const authError = parseAuthError(response);
    logger.error('authentication failed', { authError });
    throw new Error(`[SGE:LOGIN:ERROR:AUTHENTICATION] ${authError}`);
  }

  logger.debug('authenticated', { username });
}

/**
 * Request salt for hashing the account password.
 * This ensures we don't send the plaintext password over the wire.
 */
async function getPasswordHashSalt(options: {
  socket: tls.TLSSocket;
}): Promise<string> {
  const { socket } = options;

  logger.debug('getting password hash salt');

  /**
   * Send request for password hash salt:
   *  'K'
   *
   * Always get back a successful response.
   * The entire response is the hash salt, usually 32 characters in length.
   */
  const hashSalt = (
    await sendAndReceive({
      socket,
      payload: Buffer.from(`K`),
    })
  ).toString();

  logger.debug('got password hash salt');

  return hashSalt;
}

/**
 * Validate that the account has access to the game to play.
 * If the game code is invalid then the rest of the login process will fail.
 */
async function validateGameCode(options: {
  socket: tls.TLSSocket;
  gameCode: SGEGameCode;
}): Promise<void> {
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
}

/**
 * Identify the games that are available to the account.
 */
async function listAvailableGames(options: {
  socket: tls.TLSSocket;
}): Promise<Array<SGEGame>> {
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
}

/**
 * Get the account's subscription status with the game.
 */
async function getGameSubscription(options: {
  socket: tls.TLSSocket;
  gameCode: SGEGameCode;
}): Promise<SGEGameSubscription> {
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
}

/**
 * Select character to play and get back game play credentials.
 */
async function getGameCredentials(options: {
  socket: tls.TLSSocket;
  characterName: string;
}): Promise<SGEGameCredentials> {
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
    key: gameKey, // secret key used to authenticate to the game server
  };
}

/**
 * Get the character id which is needed to get game play credentials.
 */
async function getCharacterId(options: {
  socket: tls.TLSSocket;
  characterName: string;
}): Promise<Maybe<string>> {
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
}

/**
 * Get list of the account's available characters.
 */
async function listAvailableCharacters(options: {
  socket: tls.TLSSocket;
}): Promise<Array<SGECharacter>> {
  const { socket } = options;

  logger.debug('listing available characters');

  /**
   * Get list of the account's available character names and ids
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
}
