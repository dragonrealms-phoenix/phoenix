import * as net from 'node:net';
import { sleep } from '../../../common/async';
import type { SGEGameCredentials } from '../../sge';
import { NetSocketMock } from '../__mocks__/net-socket.mock';
import { GameSocketImpl } from '../game.socket';
import type { GameSocket } from '../game.types';

describe('game-socket', () => {
  const credentials: SGEGameCredentials = {
    host: 'localhost',
    port: 1234,
    key: 'test-key',
  };

  const mockNetConnect = (options?: {
    emitError?: boolean;
    emitTimeout?: boolean;
  }) => {
    return (
      connectOptions: any & net.NetConnectOpts,
      connectionListener: any & (() => void)
    ) => {
      const mockSocket = new NetSocketMock({
        timeout: connectOptions.timeout ?? 30_000,
        emitError: options?.emitError ?? false,
        emitTimeout: options?.emitTimeout ?? false,
      });

      mockSocket.connect(connectOptions);

      connectionListener();

      mockSockets.push(mockSocket);

      return mockSocket;
    };
  };

  let mockSockets = new Array<NetSocketMock>();

  let socket: GameSocket;

  let subscriber1NextSpy: jest.Mock;
  let subscriber2NextSpy: jest.Mock;

  let subscriber1ErrorSpy: jest.Mock;
  let subscriber2ErrorSpy: jest.Mock;

  let subscriber1CompleteSpy: jest.Mock;
  let subscriber2CompleteSpy: jest.Mock;

  beforeEach(() => {
    mockSockets = new Array<NetSocketMock>();

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
      jest.spyOn(net, 'connect').mockImplementation(mockNetConnect());

      const onConnectSpy = jest.fn();
      const onDisconnectSpy = jest.fn();

      socket = new GameSocketImpl({
        credentials,
        onConnect: onConnectSpy,
        onDisconnect: onDisconnectSpy,
      });

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
      expect(subscriber1NextSpy).toHaveBeenNthCalledWith(
        1,
        '<mode id="GAME"/>\n'
      );
      expect(subscriber1NextSpy).toHaveBeenNthCalledWith(2, '<data/>\n');
      expect(subscriber1ErrorSpy).toHaveBeenCalledTimes(0);
      expect(subscriber1CompleteSpy).toHaveBeenCalledTimes(1);

      // Subsequent subscribers only receive new events.
      expect(subscriber2NextSpy).toHaveBeenCalledTimes(1);
      expect(subscriber2NextSpy).toHaveBeenNthCalledWith(1, '<data/>\n');
      expect(subscriber2ErrorSpy).toHaveBeenCalledTimes(0);
      expect(subscriber2CompleteSpy).toHaveBeenCalledTimes(1);

      expect(onConnectSpy).toHaveBeenCalledTimes(1);
      expect(onDisconnectSpy).toHaveBeenCalledTimes(2);

      expect(onDisconnectSpy).toHaveBeenNthCalledWith(1, 'end', undefined);
      expect(onDisconnectSpy).toHaveBeenNthCalledWith(2, 'close', undefined);

      expect(mockSockets[0].pauseSpy).toHaveBeenCalledTimes(1);
      expect(mockSockets[0].destroySoonSpy).toHaveBeenCalledTimes(1);
    });

    it('should disconnect previous connection when a new connection is made', async () => {
      jest.spyOn(net, 'connect').mockImplementation(mockNetConnect());

      const onConnectSpy = jest.fn();
      const onDisconnectSpy = jest.fn();

      socket = new GameSocketImpl({
        credentials,
        onConnect: onConnectSpy,
        onDisconnect: onDisconnectSpy,
      });

      // ---

      await socket.connect();

      await sleep(1000);

      expect(onConnectSpy).toHaveBeenCalledTimes(1);
      expect(onDisconnectSpy).toHaveBeenCalledTimes(0);

      expect(mockSockets[0].pauseSpy).toHaveBeenCalledTimes(0);
      expect(mockSockets[0].destroySoonSpy).toHaveBeenCalledTimes(0);

      jest.clearAllMocks();

      await socket.connect(); // disconnects previous connection

      await sleep(1000);

      expect(onConnectSpy).toHaveBeenCalledTimes(1);
      expect(onDisconnectSpy).toHaveBeenCalledTimes(2);

      expect(onDisconnectSpy).toHaveBeenNthCalledWith(1, 'end', undefined);
      expect(onDisconnectSpy).toHaveBeenNthCalledWith(2, 'close', undefined);

      expect(mockSockets[0].pauseSpy).toHaveBeenCalledTimes(1);
      expect(mockSockets[0].destroySoonSpy).toHaveBeenCalledTimes(1);
    });

    it('should send credentials and headers to the game server on connect', async () => {
      jest.spyOn(net, 'connect').mockImplementation(mockNetConnect());

      const onConnectSpy = jest.fn();
      const onDisconnectSpy = jest.fn();

      socket = new GameSocketImpl({
        credentials,
        onConnect: onConnectSpy,
        onDisconnect: onDisconnectSpy,
      });

      // ---

      await socket.connect();

      await sleep(1000);

      expect(onConnectSpy).toHaveBeenCalledTimes(1);

      expect(mockSockets[0].writeSpy).toHaveBeenCalledTimes(3);
      expect(mockSockets[0].writeSpy).toHaveBeenNthCalledWith(1, 'test-key\n');
      expect(mockSockets[0].writeSpy).toHaveBeenNthCalledWith(
        2,
        `FE:WRAYTH /VERSION:1.0.1.26 /P:${process.platform.toUpperCase()} /XML\n`
      );
      expect(mockSockets[0].writeSpy).toHaveBeenNthCalledWith(3, `\n\n`);
    });
  });

  describe('#disconnect', () => {
    it('should disconnect from the game server', async () => {
      jest.spyOn(net, 'connect').mockImplementation(mockNetConnect());

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

      expect(mockSockets[0].pauseSpy).toHaveBeenCalledTimes(1);
      expect(mockSockets[0].destroySoonSpy).toHaveBeenCalledTimes(1);
    });

    it('should disconnect from the game server when an error occurs', async () => {
      jest.spyOn(net, 'connect').mockImplementation(
        mockNetConnect({
          emitError: true,
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

      expect(mockSockets[0].pauseSpy).toHaveBeenCalledTimes(1);
      expect(mockSockets[0].destroySoonSpy).toHaveBeenCalledTimes(1);
    });

    it('should disconnect from the game server when a timeout occurs', async () => {
      jest.spyOn(net, 'connect').mockImplementation(
        mockNetConnect({
          emitTimeout: true,
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

      expect(onDisconnectSpy).toHaveBeenNthCalledWith(1, 'timeout', undefined);
      expect(onDisconnectSpy).toHaveBeenNthCalledWith(2, 'end', undefined);
      expect(onDisconnectSpy).toHaveBeenNthCalledWith(3, 'close', undefined);

      expect(mockSockets[0].pauseSpy).toHaveBeenCalledTimes(1);
      expect(mockSockets[0].destroySoonSpy).toHaveBeenCalledTimes(1);
    });

    it('should ignore disconnect request if not connected', async () => {
      jest.spyOn(net, 'connect').mockImplementation(mockNetConnect());

      const onConnectSpy = jest.fn();
      const onDisconnectSpy = jest.fn();

      socket = new GameSocketImpl({
        credentials,
        onConnect: onConnectSpy,
        onDisconnect: onDisconnectSpy,
      });

      // ---

      await socket.disconnect();

      expect(onConnectSpy).toHaveBeenCalledTimes(0);
      expect(onDisconnectSpy).toHaveBeenCalledTimes(0);

      // Since we never connected then no mock socket was created.
      expect(mockSockets).toHaveLength(0);
    });
  });

  describe('#send', () => {
    it('should send commands when connected to the game server', async () => {
      jest.spyOn(net, 'connect').mockImplementation(mockNetConnect());

      socket = new GameSocketImpl({
        credentials,
      });

      // ---

      await socket.connect();

      await sleep(1000);

      socket.send('test-command');

      expect(mockSockets[0].writeSpy).toHaveBeenCalledWith('test-command\n');
    });

    it('should throw error when never connected to the game server', async () => {
      jest.spyOn(net, 'connect').mockImplementation(mockNetConnect());

      socket = new GameSocketImpl({
        credentials,
      });

      // ---

      // We never connect so the underlying socket is not writable.
      // This could happen if someone uses the game socket just like this test:
      // tries to send the command but never called `connect` first.

      try {
        socket.send('test-command');
        fail('it should throw an error');
      } catch (error) {
        expect(error).toEqual(
          new Error(
            `[GAME:SOCKET:STATUS:NOT_WRITABLE] cannot send commands: test-command`
          )
        );
      }
    });

    it('should throw error when socket is not writable', async () => {
      jest.spyOn(net, 'connect').mockImplementation(
        mockNetConnect({
          emitError: true,
        })
      );

      socket = new GameSocketImpl({
        credentials,
      });

      // ---

      // We connect, but by the time we send the commands
      // then we simulate that the underlying socket is not writable anymore.
      // This could happen if the game server disconnects us.
      await socket.connect();

      await sleep(1000);

      try {
        socket.send('test-command');
        fail('it should throw an error');
      } catch (error) {
        expect(error).toEqual(
          new Error(
            `[GAME:SOCKET:STATUS:NOT_WRITABLE] cannot send commands: test-command`
          )
        );
      }
    });

    it('should throw error when socket has been disconnected', async () => {
      jest.spyOn(net, 'connect').mockImplementation(mockNetConnect());

      socket = new GameSocketImpl({
        credentials,
      });

      // ---

      await socket.connect();

      await sleep(1000);

      await socket.disconnect();

      await sleep(1000);

      try {
        socket.send('test-command');
        fail('it should throw an error');
      } catch (error) {
        expect(error).toEqual(
          new Error(
            `[GAME:SOCKET:STATUS:NOT_WRITABLE] cannot send commands: test-command`
          )
        );
      }
    });
  });
});
