import { GameCode } from '../../common/game/types.js';

export enum SGEGameProtocol {
  STORMFRONT = 'STORM',
}

/**
 * Simutronics has multiple games and instances per game.
 * Only interested in DragonRealms, though.
 */
export enum SGEGameCode {
  DRAGONREALMS_PRIME = GameCode.PRIME,
  DRAGONREALMS_FALLEN = GameCode.FALLEN,
  DRAGONREALMS_PLATINUM = GameCode.PLATINUM,
  DRAGONREALMS_TEST = GameCode.TEST,
  DRAGONREALMS_DEVELOPMENT = GameCode.DEVELOPMENT,
}

export interface SGEGame {
  /**
   * Name of a game, like 'DragonRealms' or 'DragonRealms The Fallen'
   */
  name: string;
  /**
   * Identifier of a game, like 'DR' or 'DRF'
   */
  code: SGEGameCode;
}

export interface SGEGameSubscription {
  /**
   * Which game the subscription is for.
   */
  game: SGEGame;
  /**
   * The account's subscription status.
   */
  status: string;
}

/**
 * Once successfully authenticated to SGE,
 * these are the new credentials to use to connect to the game.
 */
export interface SGEGameCredentials {
  /**
   * Host where to access the game.
   */
  host: string;
  /**
   * Port where to access the game.
   */
  port: number;
  /**
   * Token to access the game as a specific character.
   */
  accessToken: string;
}

export interface SGELoginResponse {
  subscription: SGEGameSubscription;
  credentials: SGEGameCredentials;
}

export interface SGECharacter {
  /**
   * Unique identifier of the character.
   * Retrieved and used automatically during login protocol.
   * Players rarely know what this is.
   */
  id: string;
  /**
   * Name of the character.
   * What player's know their character as.
   */
  name: string;
}

export interface SGEService {
  loginCharacter(characterName: string): Promise<SGEGameCredentials>;
  listCharacters(): Promise<Array<SGECharacter>>;
}
