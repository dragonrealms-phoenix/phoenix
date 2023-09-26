export enum SGEGameProtocol {
  STORMFRONT = 'STORM',
}

/**
 * Simutronics has multiple games and instances per game.
 * Only interested in DragonRealms, though.
 */
export enum SGEGameCode {
  DRAGONREALMS = 'DR',
  DRAGONREALMS_DEVELOPMENT = 'DRD',
  DRAGONREALMS_THE_FALLEN = 'DRF',
  DRAGONREALMS_PRIME_TEST = 'DRT',
  DRAGONREALMS_PLATINUM = 'DRX',
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
   * Authorization key to access the game as a specific character.
   */
  key: string;
}

export interface SGELoginResponse {
  subscription: SGEGameSubscription;
  credentials: SGEGameCredentials;
}
