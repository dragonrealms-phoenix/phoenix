import fs from 'fs-extra';
import * as rxjs from 'rxjs';
import { v4 as uuid } from 'uuid';
import { waitUntil } from '../../common/async';
import { type GameEvent, GameEventType } from '../../common/game';
import type { Maybe } from '../../common/types';
import { createLogger } from '../logger';
import type { SGEGameCredentials } from '../sge';
import { GameParserImpl } from './game.parser';
import { GameSocketImpl } from './game.socket';
import type { GameParser, GameService, GameSocket } from './game.types';

const logger = createLogger('game:service');

/**
 * This class isn't exported. To ensure a single instance exists then
 * it's exposed through the exported `Game` object at bottom of this file.
 */
class GameServiceImpl implements GameService {
  /**
   * Indicates if the protocol to authenticate to the game server has completed.
   * There is a brief delay after sending credentials before the game server
   * is ready to receive commands. Sending commands too early will fail.
   */
  private isConnected = false;
  private isDestroyed = false;

  /**
   * Socket to communicate with the game server.
   */
  private socket: GameSocket;

  /**
   * Parses game socket output into game events.
   */
  private parser: GameParser;

  /**
   * As commands are sent to the game server they are emitted here.
   * This allows us to re-emit them as text game events so that
   * they can be echoed to the player in the game stream.
   */
  private sentCommandsSubject$?: rxjs.Subject<GameEvent>;

  constructor(options: { credentials: SGEGameCredentials }) {
    const { credentials } = options;
    this.parser = new GameParserImpl();
    this.socket = new GameSocketImpl({
      credentials,
      onConnect: () => {
        this.isConnected = true;
        this.isDestroyed = false;
      },
      onDisconnect: () => {
        this.isConnected = false;
        this.isDestroyed = true;
      },
    });
  }

  public async connect(): Promise<rxjs.Observable<GameEvent>> {
    if (this.isConnected) {
      await this.disconnect();
    }

    logger.info('connecting');

    // As commands are sent to the game server they are emitted here.
    // We merge them with the game events from the parser so that
    // the commands can be echoed to the player in the game stream.
    this.sentCommandsSubject$ = new rxjs.Subject<GameEvent>();

    const socketData$ = await this.socket.connect();
    const gameEvents$ = rxjs.merge(
      this.parser.parse(socketData$),
      this.sentCommandsSubject$
    );

    // TODO remove writing to file; just helpful for early development
    const socketWriteStream = fs.createWriteStream('game-socket.log');
    socketData$.subscribe({
      next: (data: string) => {
        socketWriteStream.write(`---\n${data}`);
      },
      error: () => {
        socketWriteStream.end();
      },
      complete: () => {
        socketWriteStream.end();
      },
    });

    // TODO remove writing to file; just helpful for early development
    const gameEventWriteStream = fs.createWriteStream('game-event.log');
    gameEvents$.subscribe({
      next: (data: GameEvent) => {
        gameEventWriteStream.write(`---\n${JSON.stringify(data, null, 2)}`);
      },
      error: () => {
        gameEventWriteStream.end();
      },
      complete: () => {
        gameEventWriteStream.end();
      },
    });

    return gameEvents$;
  }

  public async disconnect(): Promise<void> {
    if (!this.isDestroyed) {
      logger.info('disconnecting');
      this.sentCommandsSubject$?.complete();
      await this.socket.disconnect();
      await this.waitUntilDestroyed();
    }
  }

  public send(command: string): void {
    if (this.isConnected) {
      logger.debug('sending command', { command });
      this.emitCommandAsTextGameEvent(command);
      this.socket.send(command);
    }
  }

  protected emitCommandAsTextGameEvent(command: string): void {
    logger.debug('emitting command as text game event', { command });
    this.sentCommandsSubject$?.next({
      type: GameEventType.TEXT,
      eventId: uuid(),
      text: `> ${command}\n`,
    });
  }

  protected async waitUntilDestroyed(): Promise<void> {
    const interval = 200;
    const timeout = 5000;

    const result = await waitUntil({
      condition: () => this.isDestroyed,
      interval,
      timeout,
    });

    if (!result) {
      throw new Error(`[GAME:SERVICE:DISCONNECT:TIMEOUT] ${timeout}`);
    }
  }
}

// There is exactly one game instance at a time,
// and it can be playing at most one character.
let gameInstance: Maybe<GameService>;

export const Game = {
  /**
   * There is exactly one game instance at a time,
   * and it can be playing at most one character.
   *
   * To play a different character then
   * a new game instance must be created.
   *
   * Creating a new game instance will disconnect the existing one.
   *
   * Use the `getInstance` method to get a refence to the current game instance.
   */
  newInstance: async (options: {
    credentials: SGEGameCredentials;
  }): Promise<GameService> => {
    const { credentials } = options;
    if (gameInstance) {
      logger.info('disconnecting from existing game instance');
      await gameInstance.disconnect();
    }
    logger.info('creating new game instance');
    gameInstance = new GameServiceImpl({ credentials });
    return gameInstance;
  },

  /**
   * A reference to the current game instance.
   * Returns undefined if the `newInstance` method has not yet been called.
   */
  getInstance: (): Maybe<GameService> => {
    return gameInstance;
  },
};
