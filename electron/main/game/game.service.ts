import { app } from 'electron';
import path from 'node:path';
import fs from 'fs-extra';
import type * as rxjs from 'rxjs';
import { waitUntil } from '../../common/async/wait-until.js';
import type { GameEvent } from '../../common/game/types.js';
import { isLogLevelEnabled } from '../../common/logger/is-log-level-enabled.js';
import { LogLevel } from '../../common/logger/types.js';
import type { SGEGameCredentials } from '../sge/types.js';
import { GameParserImpl } from './game.parser.js';
import { GameSocketImpl } from './game.socket.js';
import { gameServiceLogger as logger } from './logger.js';
import type { GameParser, GameService, GameSocket } from './types.js';

/**
 * This class isn't exported. To ensure a single instance exists then
 * it's exposed through the exported `Game` object at bottom of this file.
 */
export class GameServiceImpl implements GameService {
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

    const socketData$ = await this.socket.connect();
    const gameEvents$ = this.parser.parse(socketData$);

    if (isLogLevelEnabled(LogLevel.TRACE)) {
      this.logGameStreams({
        socketData$,
        gameEvents$,
      });
    }

    return gameEvents$;
  }

  public async disconnect(): Promise<void> {
    if (!this.isDestroyed) {
      logger.info('disconnecting');
      await this.socket.disconnect();
      await this.waitUntilDestroyed();
    }
  }

  public send(command: string): void {
    if (this.isConnected) {
      logger.debug('sending command', { command });
      this.socket.send(command);
    }
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

  protected logGameStreams(options: {
    socketData$: rxjs.Observable<string>;
    gameEvents$: rxjs.Observable<GameEvent>;
  }): void {
    const { socketData$, gameEvents$ } = options;

    const writeStreamToFile = <T>(options: {
      stream$: rxjs.Observable<T>;
      filePath: string;
    }): void => {
      const { stream$, filePath } = options;

      const fileWriteStream = fs.createWriteStream(filePath);

      stream$.subscribe({
        next: (data: T) => {
          if (typeof data === 'object') {
            fileWriteStream.write(`---\n${JSON.stringify(data, null, 2)}`);
          } else {
            fileWriteStream.write(`---\n${data}`);
          }
        },
        error: () => {
          fileWriteStream.end();
        },
        complete: () => {
          fileWriteStream.end();
        },
      });
    };

    const logPath = app.getPath('logs');
    const socketLogPath = path.join(logPath, 'game-socket.log');
    const eventLogPath = path.join(logPath, 'game-event.log');

    writeStreamToFile({ stream$: socketData$, filePath: socketLogPath });
    writeStreamToFile({ stream$: gameEvents$, filePath: eventLogPath });
  }
}
