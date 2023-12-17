import net from 'node:net';
import { merge } from 'lodash';
import { runInBackground, sleep } from '../../common/async';
import type { Maybe } from '../../common/types';
import { createLogger } from '../logger';
import type { SGEGameCredentials } from '../sge';
import type { Dispatcher } from '../types';
import type { GameService } from './game.types';

const logger = createLogger('game');

class GameServiceImpl implements GameService {
  /**
   * Psuedo-observable pattern.
   * The process that instantiates this class can subscribe to events.
   */
  private dispatch: Dispatcher;

  /**
   * Credentials used to connect to the game server.
   */
  private credentials: SGEGameCredentials;

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
  private socket?: net.Socket;

  constructor(options: {
    credentials: SGEGameCredentials;
    dispatch: Dispatcher;
  }) {
    const { credentials, dispatch } = options;
    this.dispatch = dispatch;
    this.credentials = credentials;
  }

  public async connect(): Promise<boolean> {
    logger.info('connecting');
    if (this.socket) {
      // Due to async nature of socket event handling and that we need
      // to manage instance variable state, we cannot allow the socket
      // to be recreated because it causes inconsistent and invalid state.
      logger.warn('instance may only connect once, ignoring request');
      return false;
    }
    const { host, port } = this.credentials;
    this.socket = this.createGameSocket({ host, port });
    await this.waitUntilConnectedOrDestroyed();
    return this.isConnected;
  }

  public async disconnect(): Promise<void> {
    logger.info('disconnecting');
    if (!this.socket) {
      logger.warn('instance never connected, ignoring request');
      return;
    }
    if (this.isDestroyed) {
      logger.warn('instance already disconnected, ignoring request');
      return;
    }
    this.send('quit'); // log character out of game
    this.socket.destroySoon(); // flush writes then end socket connection
    this.isConnected = false;
    this.isDestroyed = true;
  }

  public send(command: string): void {
    if (!this.socket?.writable) {
      throw new Error(`[GAME:SOCKET:STATUS] cannot send commands: ${command}`);
    }
    if (this.isConnected) {
      logger.debug('sending command', { command });
      this.socket.write(`${command}\n`);
    }
  }

  protected async waitUntilConnectedOrDestroyed(): Promise<void> {
    // TODO add timeout
    while (!this.isConnected && !this.isDestroyed) {
      await sleep(200);
    }
  }

  protected createGameSocket(connectOptions?: net.NetConnectOpts): net.Socket {
    const defaultOptions: net.NetConnectOpts = {
      host: 'dr.simutronics.net',
      port: 11024,
    };

    const mergedOptions = merge(defaultOptions, connectOptions);

    const { host, port } = mergedOptions;

    this.isConnected = false;
    this.isDestroyed = false;

    const onGameConnect = (): void => {
      if (!this.isConnected) {
        this.isConnected = true;
        this.isDestroyed = false;
        this.dispatch('TODO-channel-name', 'connect');
      }
    };

    const onGameDisconnect = (): void => {
      if (!this.isDestroyed) {
        this.isConnected = false;
        this.isDestroyed = true;
        socket.destroySoon();
        this.dispatch('TODO-channel-name', 'disconnect');
      }
    };

    logger.info('connecting to game server', { host, port });
    const socket = net.connect(mergedOptions, (): void => {
      logger.info('connected to game server', { host, port });
    });

    let buffer: string = '';
    socket.on('data', (data: Buffer): void => {
      // TODO parse game data
      // TODO eventually emit formatted messages via this.dispatch
      // TODO explore if should use rxjs with socket

      logger.debug('socket received fragment');
      buffer += data.toString('utf8');
      if (buffer.endsWith('\n')) {
        const message = buffer;
        logger.debug('socket received message', { message });
        if (!this.isConnected && message.startsWith('<mode id="GAME"/>')) {
          onGameConnect();
        }
        // TODO this is when I would emit a payload via rxjs
        this.dispatch('TODO-channel-name', message);
        buffer = '';
      }
    });

    socket.on('connect', () => {
      logger.info('authenticating with game key');

      // The frontend used to be named "StormFront" or "Storm" but around 2023
      // it was renamed to "Wrayth". The version is something I found common
      // on GitHub among other clients. I did not notice a theme for the platform
      // of the code I reviewed. I assume the last flag is to request XML formatted feed.
      const frontendHeader = `FE:WRAYTH /VERSION:1.0.1.26 /P:${process.platform.toUpperCase()} /XML`;

      socket.write(`${this.credentials.key}\n`);
      socket.write(`${frontendHeader}\n`);

      // Once authenticated, send newlines to get to the game prompt.
      // Otherwise the game may not begin streaming data to us.
      // There needs to be a delay to allow the server to negotiate the connect.
      setTimeout(() => {
        // Handle if socket is closed before this timeout.
        if (socket.writable) {
          socket.write(`\n\n`);
        }
      }, 1000);
    });

    socket.on('end', (): void => {
      logger.info('connection to game server ended', { host, port });
      onGameDisconnect();
    });

    socket.on('close', (): void => {
      logger.info('connection to game server closed', { host, port });
      onGameDisconnect();
    });

    socket.on('timeout', (): void => {
      const timeout = socket.timeout;
      logger.error('game server timed out', { host, port, timeout });
      onGameDisconnect();
    });

    socket.on('error', (error: Error): void => {
      logger.error('game server error', { host, port, error });
      onGameDisconnect();
    });

    return socket;
  }
}

let gameInstance: Maybe<GameService>;

const Game = {
  initInstance: (options: {
    credentials: SGEGameCredentials;
    dispatch: Dispatcher;
  }): GameService => {
    const { credentials, dispatch } = options;
    if (gameInstance) {
      logger.info('disconnecting from existing game instance');
      const oldInstance = gameInstance;
      runInBackground(async () => {
        await oldInstance.disconnect();
      });
    }
    logger.info('creating new game instance');
    gameInstance = new GameServiceImpl({ credentials, dispatch });
    return gameInstance;
  },

  getInstance: (): Maybe<GameService> => {
    return gameInstance;
  },
};

export { Game };
