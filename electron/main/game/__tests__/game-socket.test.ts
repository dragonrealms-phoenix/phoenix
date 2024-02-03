import * as net from 'node:net';
import type { Mock } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runInBackground } from '../../../common/async/run-in-background.js';
import type { SGEGameCredentials } from '../../sge/types.js';
import { NetSocketMock } from '../__mocks__/net-socket.mock.js';
import { GameSocketImpl } from '../game.socket.js';

type NetModule = typeof import('node:net');

// Each test method will provide a new mocked net socket.
// Although at this point we are just returning the original module,
// we have to mock it with vitest otherwise the module is staticly loaded and
// we will get errors trying to mock implementations for any methods on it.
vi.mock('net', async (importOriginal) => {
  const originalModule = await importOriginal<NetModule>();

  const netMock: Partial<NetModule> = {
    ...originalModule,
  };

  return netMock;
});

describe('game-socket', () => {
  const credentials: SGEGameCredentials = {
    host: 'localhost',
    port: 1234,
    accessToken: 'test-token',
  };

  /**
   * For mocking the `net.connect()` static method.
   * Retuns a function that when called creates a new `NetSocketMock` instance.
   * Keeps track of all created mock sockets so we can assert their usage.
   */
  const mockNetConnect = () => {
    return (
      connectOptions: string | net.NetConnectOpts,
      connectionListener?: () => void
    ): NetSocketMock => {
      let timeout = 30_000;
      if (typeof connectOptions === 'object' && connectOptions.timeout) {
        timeout = connectOptions.timeout;
      }
      const mockSocket = new NetSocketMock({
        timeout,
      });

      mockSocket.connect(connectOptions);

      connectionListener?.();

      mockSockets.push(mockSocket);

      return mockSocket;
    };
  };

  // List of all sockets created by the tests.
  let mockSockets = new Array<NetSocketMock>();

  let subscriber1NextSpy: Mock;
  let subscriber2NextSpy: Mock;

  let subscriber1ErrorSpy: Mock;
  let subscriber2ErrorSpy: Mock;

  let subscriber1CompleteSpy: Mock;
  let subscriber2CompleteSpy: Mock;

  beforeEach(() => {
    mockSockets = new Array<NetSocketMock>();

    subscriber1NextSpy = vi.fn();
    subscriber2NextSpy = vi.fn();

    subscriber1ErrorSpy = vi.fn();
    subscriber2ErrorSpy = vi.fn();

    subscriber1CompleteSpy = vi.fn();
    subscriber2CompleteSpy = vi.fn();

    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#connect', () => {
    it('connects to the game server, receive messages, and then disconnect', async () => {
      const mockSocket = mockNetConnect()('mock', vi.fn());
      vi.spyOn(net, 'connect').mockImplementation(() => mockSocket);

      const onConnectSpy = vi.fn();
      const onDisconnectSpy = vi.fn();

      const socket = new GameSocketImpl({
        credentials,
        onConnect: onConnectSpy,
        onDisconnect: onDisconnectSpy,
      });

      // ---

      // Connect to socket and begin listening for data.
      const socketDataPromise = socket.connect();

      // At this point the socket is listening for data from the game server.
      // Emit data from the game server signaling that the connection is ready.
      mockSocket.emitData('<mode id="GAME"/>\n');

      // Now we can await the promise to get hold of the socket observable.
      //
      // If we emit the data before the socket is listening then it never
      // hears it and will never resolve (bad).
      //
      // If we await the connect then we're in a deadlock because the test
      // never gets to emit the data to tell the socket to resolve. (bad)
      //
      // The workaround is to asynchronously start the connect then
      // emit the data then await, kind of like a "fork join" concept.
      const socketData$ = await socketDataPromise;

      // first subscriber
      socketData$.subscribe({
        next: subscriber1NextSpy,
        error: subscriber1ErrorSpy,
        complete: subscriber1CompleteSpy,
      });

      // second subscriber
      socketData$.subscribe({
        next: subscriber2NextSpy,
        error: subscriber2ErrorSpy,
        complete: subscriber2CompleteSpy,
      });

      mockSocket.emitData('<data/>\n');

      await vi.runAllTimersAsync();

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

      expect(mockSocket.pauseSpy).toHaveBeenCalledTimes(1);
      expect(mockSocket.destroySoonSpy).toHaveBeenCalledTimes(1);
    });

    it('disconnects previous connection when a new connection is made', async () => {
      const mockSocket = mockNetConnect()('mock', vi.fn());
      vi.spyOn(net, 'connect').mockImplementation(() => mockSocket);

      const onConnectSpy = vi.fn();
      const onDisconnectSpy = vi.fn();

      const socket = new GameSocketImpl({
        credentials,
        onConnect: onConnectSpy,
        onDisconnect: onDisconnectSpy,
      });

      // ---

      // Connect to socket and begin listening for data.
      const socketDataPromise = socket.connect();

      // At this point the socket is listening for data from the game server.
      // Emit data from the game server signaling that the connection is ready.
      mockSocket.emitData('<mode id="GAME"/>\n');

      // Now we can await the promise to get hold of the socket observable.
      //
      // If we emit the data before the socket is listening then it never
      // hears it and will never resolve (bad).
      //
      // If we await the connect then we're in a deadlock because the test
      // never gets to emit the data to tell the socket to resolve. (bad)
      //
      // The workaround is to asynchronously start the connect then
      // emit the data then await, kind of like a "fork join" concept.
      const _socketData$ = await socketDataPromise;

      await vi.runAllTimersAsync();

      expect(onConnectSpy).toHaveBeenCalledTimes(1);
      expect(onDisconnectSpy).toHaveBeenCalledTimes(0);

      expect(mockSocket.pauseSpy).toHaveBeenCalledTimes(0);
      expect(mockSocket.destroySoonSpy).toHaveBeenCalledTimes(0);

      vi.clearAllMocks();

      // Connect again which disconnects previous connection
      runInBackground(async () => {
        await socket.connect();
      });

      mockSocket.emitData('<mode id="GAME"/>\n');

      await vi.runAllTimersAsync();

      expect(onConnectSpy).toHaveBeenCalledTimes(1);
      expect(onDisconnectSpy).toHaveBeenCalledTimes(2);

      expect(onDisconnectSpy).toHaveBeenNthCalledWith(1, 'end', undefined);
      expect(onDisconnectSpy).toHaveBeenNthCalledWith(2, 'close', undefined);

      expect(mockSocket.pauseSpy).toHaveBeenCalledTimes(1);
      expect(mockSocket.destroySoonSpy).toHaveBeenCalledTimes(1);
    });

    it('sends credentials and headers to the game server on connect', async () => {
      const mockSocket = mockNetConnect()('mock', vi.fn());
      vi.spyOn(net, 'connect').mockImplementation(() => mockSocket);

      const onConnectSpy = vi.fn();
      const onDisconnectSpy = vi.fn();

      const socket = new GameSocketImpl({
        credentials,
        onConnect: onConnectSpy,
        onDisconnect: onDisconnectSpy,
      });

      // ---

      // Connect to socket and begin listening for data.
      const socketDataPromise = socket.connect();

      // At this point the socket is listening for data from the game server.
      // Emit data from the game server signaling that the connection is ready.
      mockSocket.emitData('<mode id="GAME"/>\n');

      // Now we can await the promise to get hold of the socket observable.
      //
      // If we emit the data before the socket is listening then it never
      // hears it and will never resolve (bad).
      //
      // If we await the connect then we're in a deadlock because the test
      // never gets to emit the data to tell the socket to resolve. (bad)
      //
      // The workaround is to asynchronously start the connect then
      // emit the data then await, kind of like a "fork join" concept.
      const _socketData$ = await socketDataPromise;

      // Run timer so that the delayed newlines sent on connect are seen.
      await vi.runAllTimersAsync();

      expect(onConnectSpy).toHaveBeenCalledTimes(1);

      expect(mockSocket.writeSpy).toHaveBeenCalledTimes(3);
      expect(mockSocket.writeSpy).toHaveBeenNthCalledWith(1, 'test-token\n');
      expect(mockSocket.writeSpy).toHaveBeenNthCalledWith(
        2,
        `FE:WRAYTH /VERSION:1.0.1.26 /P:${process.platform.toUpperCase()} /XML\n`
      );
      expect(mockSocket.writeSpy).toHaveBeenNthCalledWith(3, `\n\n`);
    });
  });

  describe('#disconnect', () => {
    it('disconnects from the game server', async () => {
      const mockSocket = mockNetConnect()('mock', vi.fn());
      vi.spyOn(net, 'connect').mockImplementation(() => mockSocket);

      const onConnectSpy = vi.fn();
      const onDisconnectSpy = vi.fn();

      const socket = new GameSocketImpl({
        credentials,
        onConnect: onConnectSpy,
        onDisconnect: onDisconnectSpy,
      });

      // ---

      // Connect to socket and begin listening for data.
      const socketDataPromise = socket.connect();

      // At this point the socket is listening for data from the game server.
      // Emit data from the game server signaling that the connection is ready.
      mockSocket.emitData('<mode id="GAME"/>\n');

      // Now we can await the promise to get hold of the socket observable.
      //
      // If we emit the data before the socket is listening then it never
      // hears it and will never resolve (bad).
      //
      // If we await the connect then we're in a deadlock because the test
      // never gets to emit the data to tell the socket to resolve. (bad)
      //
      // The workaround is to asynchronously start the connect then
      // emit the data then await, kind of like a "fork join" concept.
      const _socketData$ = await socketDataPromise;

      await vi.runAllTimersAsync();

      await socket.disconnect();

      expect(onConnectSpy).toHaveBeenCalledTimes(1);
      expect(onDisconnectSpy).toHaveBeenCalledTimes(2);

      expect(onDisconnectSpy).toHaveBeenNthCalledWith(1, 'end', undefined);
      expect(onDisconnectSpy).toHaveBeenNthCalledWith(2, 'close', undefined);

      expect(mockSocket.pauseSpy).toHaveBeenCalledTimes(1);
      expect(mockSocket.destroySoonSpy).toHaveBeenCalledTimes(1);
    });

    it('disconnects from the game server when an error occurs', async () => {
      const mockSocket = mockNetConnect()('mock', vi.fn());
      vi.spyOn(net, 'connect').mockImplementation(() => mockSocket);

      const onConnectSpy = vi.fn();
      const onDisconnectSpy = vi.fn();

      const socket = new GameSocketImpl({
        credentials,
        onConnect: onConnectSpy,
        onDisconnect: onDisconnectSpy,
      });

      // ---

      const socketDataPromise = socket.connect();

      // At this point the socket is listening for data from the game server.
      // Emit data from the game server signaling that the connection is ready.
      mockSocket.emitData('<mode id="GAME"/>\n');

      // Now we can await the promise to get hold of the socket observable.
      //
      // If we emit the data before the socket is listening then it never
      // hears it and will never resolve (bad).
      //
      // If we await the connect then we're in a deadlock because the test
      // never gets to emit the data to tell the socket to resolve. (bad)
      //
      // The workaround is to asynchronously start the connect then
      // emit the data then await, kind of like a "fork join" concept.
      const _socketData$ = await socketDataPromise;

      mockSocket.emitErrorEvent();

      await vi.runAllTimersAsync();

      expect(onConnectSpy).toHaveBeenCalledTimes(1);
      expect(onDisconnectSpy).toHaveBeenCalledTimes(3);

      expect(onDisconnectSpy).toHaveBeenNthCalledWith(
        1,
        'error',
        new Error('test')
      );
      expect(onDisconnectSpy).toHaveBeenNthCalledWith(2, 'end', undefined);
      expect(onDisconnectSpy).toHaveBeenNthCalledWith(3, 'close', undefined);

      expect(mockSocket.pauseSpy).toHaveBeenCalledTimes(1);
      expect(mockSocket.destroySoonSpy).toHaveBeenCalledTimes(1);
    });

    it('disconnects from the game server when a timeout occurs', async () => {
      const mockSocket = mockNetConnect()('mock', vi.fn());
      vi.spyOn(net, 'connect').mockImplementation(() => mockSocket);

      const onConnectSpy = vi.fn();
      const onDisconnectSpy = vi.fn();

      const socket = new GameSocketImpl({
        credentials,
        onConnect: onConnectSpy,
        onDisconnect: onDisconnectSpy,
      });

      // ---

      const socketDataPromise = socket.connect();

      // At this point the socket is listening for data from the game server.
      // Emit data from the game server signaling that the connection is ready.
      mockSocket.emitData('<mode id="GAME"/>\n');

      // Now we can await the promise to get hold of the socket observable.
      //
      // If we emit the data before the socket is listening then it never
      // hears it and will never resolve (bad).
      //
      // If we await the connect then we're in a deadlock because the test
      // never gets to emit the data to tell the socket to resolve. (bad)
      //
      // The workaround is to asynchronously start the connect then
      // emit the data then await, kind of like a "fork join" concept.
      const _socketData$ = await socketDataPromise;

      mockSocket.emitTimeoutEvent();

      await vi.runAllTimersAsync();

      expect(onConnectSpy).toHaveBeenCalledTimes(1);
      expect(onDisconnectSpy).toHaveBeenCalledTimes(3);

      expect(onDisconnectSpy).toHaveBeenNthCalledWith(1, 'timeout', undefined);
      expect(onDisconnectSpy).toHaveBeenNthCalledWith(2, 'end', undefined);
      expect(onDisconnectSpy).toHaveBeenNthCalledWith(3, 'close', undefined);

      expect(mockSocket.pauseSpy).toHaveBeenCalledTimes(1);
      expect(mockSocket.destroySoonSpy).toHaveBeenCalledTimes(1);
    });

    it('ignores disconnect request if not connected', async () => {
      const onConnectSpy = vi.fn();
      const onDisconnectSpy = vi.fn();

      const socket = new GameSocketImpl({
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
    it('sends commands when connected to the game server', async () => {
      const mockSocket = mockNetConnect()('mock', vi.fn());
      vi.spyOn(net, 'connect').mockImplementation(() => mockSocket);

      const socket = new GameSocketImpl({
        credentials,
      });

      // ---

      // Connect to socket and begin listening for data.
      const socketDataPromise = socket.connect();

      // At this point the socket is listening for data from the game server.
      // Emit data from the game server signaling that the connection is ready.
      mockSocket.emitData('<mode id="GAME"/>\n');

      // Now we can await the promise to get hold of the socket observable.
      //
      // If we emit the data before the socket is listening then it never
      // hears it and will never resolve (bad).
      //
      // If we await the connect then we're in a deadlock because the test
      // never gets to emit the data to tell the socket to resolve. (bad)
      //
      // The workaround is to asynchronously start the connect then
      // emit the data then await, kind of like a "fork join" concept.
      const _socketData$ = await socketDataPromise;

      await vi.runAllTimersAsync();

      socket.send('test-command');

      expect(mockSocket.writeSpy).toHaveBeenCalledWith('test-command\n');
    });

    it('throws error when never connected to the game server', async () => {
      const mockSocket = mockNetConnect()('mock', vi.fn());
      vi.spyOn(net, 'connect').mockImplementation(() => mockSocket);

      const socket = new GameSocketImpl({
        credentials,
      });

      // ---

      // We never connect so the underlying socket is not writable.
      // This could happen if someone uses the game socket just like this test:
      // tries to send the command but never called `connect` first.

      try {
        socket.send('test-command');
        expect.unreachable('it should throw an error');
      } catch (error) {
        expect(error).toEqual(
          new Error(
            `[GAME:SOCKET:STATUS:NOT_WRITABLE] cannot send commands: test-command`
          )
        );
      }
    });

    it('throws error when socket is not writable', async () => {
      const mockSocket = mockNetConnect()('mock', vi.fn());
      vi.spyOn(net, 'connect').mockImplementation(() => mockSocket);

      const socket = new GameSocketImpl({
        credentials,
      });

      // ---

      // We connect, but by the time we send the commands
      // then we simulate that the underlying socket is not writable anymore.
      // This could happen if the game server disconnects us.

      // Connect to socket and begin listening for data.
      const socketDataPromise = socket.connect();

      // At this point the socket is listening for data from the game server.
      // Emit data from the game server signaling that the connection is ready.
      mockSocket.emitData('<mode id="GAME"/>\n');

      // Now we can await the promise to get hold of the socket observable.
      //
      // If we emit the data before the socket is listening then it never
      // hears it and will never resolve (bad).
      //
      // If we await the connect then we're in a deadlock because the test
      // never gets to emit the data to tell the socket to resolve. (bad)
      //
      // The workaround is to asynchronously start the connect then
      // emit the data then await, kind of like a "fork join" concept.
      const _socketData$ = await socketDataPromise;

      mockSocket.emitErrorEvent();

      await vi.runAllTimersAsync();

      try {
        socket.send('test-command');
        expect.unreachable('it should throw an error');
      } catch (error) {
        expect(error).toEqual(
          new Error(
            `[GAME:SOCKET:STATUS:NOT_WRITABLE] cannot send commands: test-command`
          )
        );
      }
    });

    it('throws error when socket has been disconnected', async () => {
      const mockSocket = mockNetConnect()('mock', vi.fn());
      vi.spyOn(net, 'connect').mockImplementation(() => mockSocket);

      const socket = new GameSocketImpl({
        credentials,
      });

      // ---

      // Connect to socket and begin listening for data.
      const socketDataPromise = socket.connect();

      // At this point the socket is listening for data from the game server.
      // Emit data from the game server signaling that the connection is ready.
      mockSocket.emitData('<mode id="GAME"/>\n');

      // Now we can await the promise to get hold of the socket observable.
      //
      // If we emit the data before the socket is listening then it never
      // hears it and will never resolve (bad).
      //
      // If we await the connect then we're in a deadlock because the test
      // never gets to emit the data to tell the socket to resolve. (bad)
      //
      // The workaround is to asynchronously start the connect then
      // emit the data then await, kind of like a "fork join" concept.
      const _socketData$ = await socketDataPromise;

      await vi.runAllTimersAsync();

      await socket.disconnect();

      try {
        socket.send('test-command');
        expect.unreachable('it should throw an error');
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
