import fs from 'fs-extra';
import * as rxjs from 'rxjs';
import { waitUntil } from '../../common/async';
import type { Maybe } from '../../common/types';
import { createLogger } from '../logger';
import type { SGEGameCredentials } from '../sge';
import { GameSocketImpl } from './game.socket';
import type { GameEvent, GameService, GameSocket } from './game.types';

const logger = createLogger('game:service');

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

  constructor(options: { credentials: SGEGameCredentials }) {
    const { credentials } = options;
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

    const writeStream = fs.createWriteStream('game.log'); // TODO remove
    const gameEventsSubject$ = new rxjs.Subject<GameEvent>();
    const socketData$ = await this.socket.connect();

    socketData$.subscribe({
      next: (data: string) => {
        writeStream.write(data);
        // TODO parse data into game event(s)
        const gameEvents = new Array<any>() as Array<GameEvent>;
        gameEvents.forEach((gameEvent) => {
          gameEventsSubject$.next(gameEvent);
        });
      },
      error: (error: Error) => {
        logger.error('game socket stream error', { error });
        writeStream.end();
        gameEventsSubject$.error(error);
      },
      complete: () => {
        logger.info('game socket stream completed');
        writeStream.end();
        gameEventsSubject$.complete();
      },
    });

    return gameEventsSubject$.asObservable();
  }

  public async disconnect(): Promise<void> {
    if (!this.isDestroyed) {
      logger.info('disconnecting');
      await this.socket.disconnect();
      await this.waitUntilDestroyed();
    }
  }

  public send(command: string): void {
    this.socket.send(command);
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

let gameInstance: Maybe<GameService>;

const Game = {
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

export { Game };
