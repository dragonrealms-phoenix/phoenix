import * as net from 'node:net';
import { merge } from 'lodash';
import * as rxjs from 'rxjs';
import { waitUntil } from '../../common/async';
import { ReplayFirstSubscriberOnlySubject } from '../../common/observable';
import { createLogger } from '../logger';
import type { SGEGameCredentials } from '../sge';
import type { GameSocket } from './game.types';

const logger = createLogger('game:socket');

export class GameSocketImpl implements GameSocket {
  /**
   * Credentials used to connect to the game server.
   */
  private credentials: SGEGameCredentials;

  /**
   * Callback to notify when the socket connects to the game server.
   */
  private onConnectCallback: () => void;

  /**
   * Callback to notify when the socket disconnects from the game server.
   */
  private onDisconnectCallback: (
    /**
     * Name of the socket event that caused the disconnect.
     */
    event: 'end' | 'close' | 'timeout' | 'error',
    /**
     * Error that caused the disconnect.
     * This is only defined if the event is 'error'.
     */
    error?: Error
  ) => void;

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

  /**
   * Stream to notify subscribers of received game feed.
   */
  private socketDataSubject$?: rxjs.SubjectLike<string>;

  constructor(options: {
    /**
     * Credentials used to connect to the game server.
     */
    credentials: SGEGameCredentials;
    /**
     * To be notified when the socket connects to the game server.
     * Generally, as long as the `connect` method returns an observable
     * then this callback does not tell you anything new.
     * It does help with unit testing though.
     */
    onConnect?: () => void;
    /**
     * To be notified when the socket disconnects from the game server.
     * If you called `disconnect` then this callback does not tell you anything new.
     * If the socket disconnects unexpectedly then this callback will be called.
     * It does help with unit testing though.
     */
    onDisconnect?: (
      event: 'end' | 'close' | 'timeout' | 'error',
      error?: Error
    ) => void;
  }) {
    this.credentials = options.credentials;
    this.onConnectCallback = options.onConnect ?? (() => {});
    this.onDisconnectCallback = options.onDisconnect ?? (() => {});
  }

  public async connect(): Promise<rxjs.Observable<string>> {
    if (this.isConnected) {
      await this.disconnect();
    }

    logger.info('connecting');

    // We use this special replay subject so that we are only holding
    // events in memory until the first subscriber. This ensures no events
    // are missed, and that we efficiently don't record all subsequent events.
    this.socketDataSubject$ = new ReplayFirstSubscriberOnlySubject<string>();
    this.socket = this.createGameSocket();

    // Delay returning until the socket is connected and ready for commands.
    // Sending commands before the game server is ready will fail.
    // Also check if the socket is destroyed, which occurs if
    // the connect attempt times out or some other error is raised.
    // If we don't check both conditions then this would wait forever.
    await this.waitUntilConnectedOrDestroyed();

    if (this.isDestroyed) {
      throw new Error(
        `[GAME:SOCKET:STATUS:DESTROYED] failed to connect to game server`
      );
    }

    const socketData$ = new rxjs.Observable<string>((subscriber) => {
      return this.socketDataSubject$?.subscribe(subscriber);
    });

    return socketData$;
  }

  public async disconnect(): Promise<void> {
    if (!this.socket) {
      return;
    }

    logger.info('disconnecting');

    if (this.socket.writable) {
      this.send('quit'); // log character out of game
    }

    this.destroyGameSocket(this.socket);
  }

  public send(command: string): void {
    if (!this.socket?.writable) {
      throw new Error(
        `[GAME:SOCKET:STATUS:NOT_WRITABLE] cannot send commands: ${command}`
      );
    }

    logger.debug('sending command', { command });
    this.socket.write(`${command}\n`);
  }

  protected async waitUntilConnectedOrDestroyed(): Promise<void> {
    await Promise.race([this.waitUntilConnected(), this.waitUntilDestroyed()]);
  }

  protected async waitUntilConnected(): Promise<void> {
    const interval = 200;
    const timeout = 5000;

    const result = await waitUntil({
      condition: () => this.isConnected,
      interval,
      timeout,
    });

    if (!result) {
      throw new Error(`[GAME:SOCKET:CONNECT:TIMEOUT] ${timeout}`);
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
      throw new Error(`[GAME:SOCKET:DISCONNECT:TIMEOUT] ${timeout}`);
    }
  }

  protected createGameSocket(connectOptions?: net.NetConnectOpts): net.Socket {
    logger.info('creating game socket');

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
      }
      try {
        this.onConnectCallback();
      } catch (error) {
        logger.warn('error in connect callback', { event: 'connect', error });
      }
    };

    const onGameDisconnect = (
      event: 'end' | 'close' | 'timeout' | 'error',
      error?: Error
    ): void => {
      try {
        this.onDisconnectCallback(event, error);
      } catch (error) {
        logger.warn('error in disconnect callback', { event, error });
      }
      if (!this.isDestroyed) {
        this.destroyGameSocket(socket);
      }
    };

    logger.info('connecting to game server', { host, port });
    const socket = net.connect(mergedOptions, (): void => {
      logger.info('connected to game server', { host, port });
    });

    let buffer: string = '';
    socket.on('data', (data: Buffer): void => {
      logger.debug('socket received fragment');
      buffer += data.toString('utf8');
      if (buffer.endsWith('\n')) {
        const message = buffer;
        logger.debug('socket received message', { message });
        if (!this.isConnected && message.startsWith('<mode id="GAME"/>')) {
          onGameConnect();
        }
        this.socketDataSubject$?.next(message);
        buffer = '';
      }
    });

    socket.once('connect', () => {
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
        // Safety check in case socket status changes before the timeout.
        if (socket.writable) {
          socket.write(`\n\n`);
        }
      }, 1000).unref();
    });

    socket.once('end', (): void => {
      logger.info('connection to game server ended', { host, port });
      onGameDisconnect('end');
    });

    socket.once('close', (): void => {
      logger.info('connection to game server closed', { host, port });
      onGameDisconnect('close');
    });

    socket.once('timeout', (): void => {
      const timeout = socket.timeout;
      logger.error('game server inactivity timeout', { host, port, timeout });
      onGameDisconnect('timeout');
    });

    socket.once('error', (error: Error): void => {
      logger.error('game server error', { host, port, error });
      onGameDisconnect('error', error);
    });

    return socket;
  }

  protected destroyGameSocket(socket: net.Socket): void {
    logger.info('destroying game socket');

    this.isConnected = false;
    this.isDestroyed = true;

    socket.pause(); // stop receiving data
    socket.destroySoon(); // flush writes then end socket connection

    this.socketDataSubject$?.complete(); // notify subscribers that stream has ended
    this.socketDataSubject$ = undefined; // release reference to be garbage collected
    this.socket = undefined; // release reference to be garbage collected
  }
}
