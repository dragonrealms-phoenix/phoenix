import * as net from 'node:net';
import { sleep } from '../../../common/async';
import type { SGEGameCredentials } from '../../sge';
import { GameSocketImpl } from '../game.socket';
import type { GameSocket } from '../game.types';

// Messages that are emitted by the game server.
const messages = ['<mode id="GAME"/>\n', '<data>\n'];

const mockNetConnect = (options: { throwError?: boolean }) => {
  return (
    connectOptions: any & net.NetConnectOpts,
    connectionListener: any & (() => void)
  ) => {
    connectionListener();

    let dataListener: (data?: unknown) => void;
    let connectListener: () => void;
    let endListener: () => void;
    let closeListener: () => void;
    let timeoutListener: () => void;
    let errorListener: (error: Error) => void;

    const writable = true;
    const timeout = connectOptions.timeout ?? 30_000;

    const mockAddListener = jest
      .fn()
      .mockImplementation(
        (event: string, listener: (data?: unknown) => void) => {
          switch (event) {
            case 'data':
              dataListener = listener;
              break;
            case 'connect':
              connectListener = listener;
              setTimeout(() => {
                connectListener();
              }, 250).unref();
              setTimeout(() => {
                dataListener(messages[0]);
              }, 500).unref();
              setTimeout(() => {
                dataListener(messages[1]);
              }, 2000).unref();
              break;
            case 'end':
              endListener = listener;
              break;
            case 'close':
              closeListener = listener;
              break;
            case 'timeout':
              timeoutListener = listener;
              break;
            case 'error':
              errorListener = listener;
              if (options.throwError) {
                setTimeout(() => {
                  errorListener(new Error('test'));
                }, 2000).unref();
              }
              break;
          }
        }
      );

    return {
      writable,
      timeout,
      on: mockAddListener,
      once: mockAddListener,
      write: jest.fn(),
      pause: jest.fn(),
      destroySoon: jest.fn().mockImplementation(() => {
        endListener();
        closeListener();
      }),
    } as unknown as net.Socket;
  };
};

describe('GameSocket', () => {
  const credentials: SGEGameCredentials = {
    host: 'localhost',
    port: 1234,
    key: 'test-key',
  };

  let socket: GameSocket;

  let subscriber1NextSpy: jest.Mock;
  let subscriber2NextSpy: jest.Mock;

  let subscriber1ErrorSpy: jest.Mock;
  let subscriber2ErrorSpy: jest.Mock;

  let subscriber1CompleteSpy: jest.Mock;
  let subscriber2CompleteSpy: jest.Mock;

  beforeEach(() => {
    subscriber1NextSpy = jest.fn();
    subscriber2NextSpy = jest.fn();

    subscriber1ErrorSpy = jest.fn();
    subscriber2ErrorSpy = jest.fn();

    subscriber1CompleteSpy = jest.fn();
    subscriber2CompleteSpy = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('#connect', () => {
    it('should connect to the game server, receive messages, and then disconnect', async () => {
      jest.spyOn(net, 'connect').mockImplementation(
        mockNetConnect({
          throwError: false,
        })
      );

      socket = new GameSocketImpl({ credentials });

      // ---

      const observable = await socket.connect();

      // first subscriber
      observable.subscribe({
        next: subscriber1NextSpy,
        error: subscriber1ErrorSpy,
        complete: subscriber1CompleteSpy,
      });

      await sleep(1000);

      // second subscriber
      observable.subscribe({
        next: subscriber2NextSpy,
        error: subscriber2ErrorSpy,
        complete: subscriber2CompleteSpy,
      });

      await sleep(1000);

      await socket.disconnect();

      // First subscriber receives all buffered and new events.
      expect(subscriber1NextSpy).toHaveBeenCalledTimes(2);
      expect(subscriber1NextSpy).toHaveBeenNthCalledWith(1, messages[0]);
      expect(subscriber1NextSpy).toHaveBeenNthCalledWith(2, messages[1]);
      expect(subscriber1ErrorSpy).toHaveBeenCalledTimes(0);
      expect(subscriber1CompleteSpy).toHaveBeenCalledTimes(1);

      // Subsequent subscribers only receive new events.
      expect(subscriber2NextSpy).toHaveBeenCalledTimes(1);
      expect(subscriber2NextSpy).toHaveBeenNthCalledWith(1, messages[1]);
      expect(subscriber2ErrorSpy).toHaveBeenCalledTimes(0);
      expect(subscriber2CompleteSpy).toHaveBeenCalledTimes(1);
    });

    // TODO test connect then connect, should auto disconnect the first
  });

  describe('#disconnect', () => {
    it('should disconnect from the game server', async () => {
      jest.spyOn(net, 'connect').mockImplementation(
        mockNetConnect({
          throwError: false,
        })
      );

      const onConnectSpy = jest.fn();
      const onDisconnectSpy = jest.fn();

      socket = new GameSocketImpl({
        credentials,
        onConnect: onConnectSpy,
        onDisconnect: onDisconnectSpy,
      });

      // ---

      await socket.connect();
      await socket.disconnect();

      expect(onConnectSpy).toHaveBeenCalledTimes(1);
      expect(onDisconnectSpy).toHaveBeenCalledTimes(2);

      expect(onDisconnectSpy).toHaveBeenNthCalledWith(1, 'end', undefined);
      expect(onDisconnectSpy).toHaveBeenNthCalledWith(2, 'close', undefined);
    });

    it('should disconnect from the game server when an error occurs', async () => {
      jest.spyOn(net, 'connect').mockImplementation(
        mockNetConnect({
          throwError: true,
        })
      );

      const onConnectSpy = jest.fn();
      const onDisconnectSpy = jest.fn();

      socket = new GameSocketImpl({
        credentials,
        onConnect: onConnectSpy,
        onDisconnect: onDisconnectSpy,
      });

      // ---

      await socket.connect();

      await sleep(2000);

      expect(onConnectSpy).toHaveBeenCalledTimes(1);
      expect(onDisconnectSpy).toHaveBeenCalledTimes(3);

      expect(onDisconnectSpy).toHaveBeenNthCalledWith(
        1,
        'error',
        new Error('test')
      );
      expect(onDisconnectSpy).toHaveBeenNthCalledWith(2, 'end', undefined);
      expect(onDisconnectSpy).toHaveBeenNthCalledWith(3, 'close', undefined);
    });

    // TODO test disconnect then disconnect
  });
});
