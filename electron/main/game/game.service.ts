import { app } from 'electron';
import path from 'node:path';
import fs from 'fs-extra';
import * as rxjs from 'rxjs';
import { waitUntil } from '../../common/async/async.utils.js';
import type { GameEvent } from '../../common/game/types.js';
import { LogLevel } from '../../common/logger/types.js';
import { isLogLevelEnabled } from '../logger/logger.utils.js';
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
  private _isConnected = false;
  private _isDestroyed = false;

  /**
   * Socket to communicate with the game server.
   */
  private socket: GameSocket;

  /**
   * Parses game socket output into game events.
   */
  private parser: GameParser;

  /**
   * Commands sent to the game server.
   */
  private commands$?: rxjs.Subject<string>;

  constructor(options: { credentials: SGEGameCredentials }) {
    const { credentials } = options;

    this.socket = new GameSocketImpl({
      credentials,
      onConnect: () => {
        this._isConnected = true;
        this._isDestroyed = false;
      },
      onDisconnect: () => {
        this._isConnected = false;
        this._isDestroyed = true;
      },
    });

    this.parser = new GameParserImpl();
  }

  public isConnected(): boolean {
    return this._isConnected;
  }

  public async connect(): Promise<rxjs.Observable<GameEvent>> {
    if (this._isConnected) {
      await this.disconnect();
    }

    logger.info('connecting');

    const socketData$ = await this.socket.connect();
    const gameEvents$ = this.parser.parse(socketData$);
    this.commands$ = new rxjs.Subject<string>();

    this.logGameStreams({
      commands$: this.commands$,
      socketData$,
      gameEvents$,
    });

    return gameEvents$;
  }

  public async disconnect(): Promise<void> {
    if (!this._isDestroyed) {
      logger.info('disconnecting');
      this.commands$?.complete();
      await this.socket.disconnect();
      await this.waitUntilDestroyed();
    }
  }

  public send(command: string): void {
    if (this._isConnected) {
      logger.debug('sending command', { command });
      this.commands$?.next(command);
      this.socket.send(command);
    }
  }

  protected async waitUntilDestroyed(): Promise<void> {
    const interval = 200;
    const timeout = 5000;

    const result = await waitUntil({
      condition: () => this._isDestroyed,
      interval,
      timeout,
    });

    if (!result) {
      throw new Error(`[GAME:SERVICE:DISCONNECT:TIMEOUT] ${timeout}`);
    }
  }

  protected logGameStreams(options: {
    commands$: rxjs.Observable<string>;
    socketData$: rxjs.Observable<string>;
    gameEvents$: rxjs.Observable<GameEvent>;
  }): void {
    const { commands$, socketData$, gameEvents$ } = options;

    const writeStreamToFile = (options: {
      stream$: rxjs.Observable<unknown>;
      filePath: string;
    }): void => {
      const { stream$, filePath } = options;

      const fileWriteStream = fs.createWriteStream(filePath, {
        encoding: 'utf8',
        flags: 'w',
      });

      stream$.subscribe({
        next: (data: unknown) => {
          if (typeof data === 'object') {
            fileWriteStream.write(`---\n${JSON.stringify(data, null, 2)}`);
          } else {
            if (typeof data === 'string' && !data.endsWith('\n')) {
              data += '\n';
            }
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

    if (isLogLevelEnabled(LogLevel.INFO)) {
      writeStreamToFile({
        stream$: rxjs.merge(socketData$, commands$),
        filePath: socketLogPath,
      });
    }

    if (isLogLevelEnabled(LogLevel.DEBUG)) {
      writeStreamToFile({
        stream$: gameEvents$,
        filePath: eventLogPath,
      });
    }
  }
}
