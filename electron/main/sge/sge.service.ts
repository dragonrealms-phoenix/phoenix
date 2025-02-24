import type tls from 'node:tls';
import type { GameCode } from '../../common/game/types.js';
import { logger } from './logger.js';
import { authenticate } from './socket/authenticate.js';
import { connect } from './socket/connect.js';
import { getGameCredentials } from './socket/get-game-credentials.js';
import { getGameSubscription } from './socket/get-game-subscription.js';
import { listAvailableCharacters } from './socket/list-available-characters.js';
import { validateGameCode } from './socket/validate-game-code.js';
import type { SGECharacter, SGEGameCredentials, SGEService } from './types.js';

/**
 * SGE stands for Simutronics Game Entry
 * https://www.play.net/dr/play/sge-info.asp
 *
 * This module handles exchanging play.net credentials
 * for a DragonRealms instance session key.
 * https://elanthipedia.play.net/SGE_protocol_(saved_post)
 * https://github.com/WarlockFE/warlock2/wiki/EAccess-Protocol
 */
export class SGEServiceImpl implements SGEService {
  /**
   * Play.net account name
   */
  private username: string;

  /**
   * Play.net account password
   */
  private password: string;

  /**
   * Which instance of the game to log in to.
   */
  private gameCode: GameCode;

  constructor(options: {
    username: string;
    password: string;
    gameCode: GameCode;
  }) {
    this.username = options.username;
    this.password = options.password;
    this.gameCode = options.gameCode;
  }

  public async loginCharacter(
    /**
     * Character name to log in to the game as.
     */
    characterName: string
  ): Promise<SGEGameCredentials> {
    const socket = await connect();

    try {
      await this.authenticate({ socket });

      const credentials = await getGameCredentials({ socket, characterName });

      return credentials;
    } catch (error) {
      logger.error('error logging in', { error });
      throw error;
    } finally {
      socket.destroySoon();
    }
  }

  public async listCharacters(): Promise<Array<SGECharacter>> {
    const socket = await connect();

    try {
      await this.authenticate({ socket });

      const characters = await listAvailableCharacters({ socket });

      return characters;
    } catch (error) {
      logger.error('error listing characters', { error });
      throw error;
    } finally {
      socket.destroySoon();
    }
  }

  private async authenticate(options: {
    socket: tls.TLSSocket;
  }): Promise<void> {
    const { socket } = options;

    const username = this.username;
    const password = this.password;
    const gameCode = this.gameCode;

    // Authenticate to login server.
    await authenticate({
      socket,
      username,
      password,
    });

    // Confirm account has access to the game they want to play.
    await validateGameCode({ socket, gameCode });

    // Confirm account's subscription status to play the game.
    // We don't need this, but the SGE protocol requires us to do it
    // before we can perform other actions available to the account.
    await getGameSubscription({ socket, gameCode });
  }
}
