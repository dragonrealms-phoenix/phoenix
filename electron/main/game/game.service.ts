import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as rxjs from 'rxjs';
import { v4 as uuid } from 'uuid';
import { waitUntil } from '../../common/async';
import { type GameEvent, GameEventType } from '../../common/game';
import { LogLevel, isLogLevelEnabled } from '../../common/logger';
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
          fileWriteStream.write(`---\n${data}`);
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
