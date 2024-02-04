import * as net from 'node:net';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runInBackground } from '../../../common/async/run-in-background.js';
import type { SGEGameCredentials } from '../../sge/types.js';
import type { NetSocketMock } from '../__mocks__/net-socket.mock.js';
import { mockNetConnect } from '../__mocks__/net-socket.mock.js';
import { GameSocketImpl } from '../game.socket.js';

type NetModule = typeof import('node:net');

vi.mock('net', () => {
  const netMock: Partial<NetModule> = {
    // Each test spies on `net.connect` to specify their own socket to test.
    // Mocking the method here so that it can be spied upon as a mocked module.
    connect: vi.fn<[], net.Socket>(),
  };

  return netMock;
});

describe('game-socket', () => {
  let credentials: SGEGameCredentials;
  let mockSocket: NetSocketMock & net.Socket;

  beforeEach(() => {
    credentials = {
      host: 'localhost',
      port: 1234,
      accessToken: 'test-token',
    };

    mockSocket = mockNetConnect('mock', vi.fn());

    vi.spyOn(net, 'connect').mockImplementation(
      (
        _pathOrPortOrOptions: string | number | net.NetConnectOpts,
        connectionListener?: () => void
      ) => {
        connectionListener?.();
        return mockSocket;
      }
    );

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#connect', () => {
    it('connects to the game server, receives messages, and then disconnects', async () => {
      const subscriber1NextSpy = vi.fn();
      const subscriber2NextSpy = vi.fn();

      const subscriber1ErrorSpy = vi.fn();
      const subscriber2ErrorSpy = vi.fn();

      const subscriber1CompleteSpy = vi.fn();
      const subscriber2CompleteSpy = vi.fn();

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

      // Run timer so that the delayed newlines sent on connect are seen.
      await vi.runAllTimersAsync();

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

      // Run timer so that the delayed newlines sent on connect are seen.
      await vi.runAllTimersAsync();

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

      // Run timer so that the delayed newlines sent on connect are seen.
      await vi.runAllTimersAsync();

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

      expect(onConnectSpy).toHaveBeenCalledTimes(1);

      expect(mockSocket.writeSpy).toHaveBeenCalledTimes(3);
      expect(mockSocket.writeSpy).toHaveBeenNthCalledWith(1, 'test-token\n');
      expect(mockSocket.writeSpy).toHaveBeenNthCalledWith(
        2,
        `FE:WRAYTH /VERSION:1.0.1.26 /P:${process.platform.toUpperCase()} /XML\n`
      );
      expect(mockSocket.writeSpy).toHaveBeenNthCalledWith(3, `\n\n`);
    });

    it('throws error if socket times out during connect', async () => {
      const socket = new GameSocketImpl({ credentials });

      // ---

      try {
        // Connect to socket and begin listening for data.
        const socketDataPromise = socket.connect();

        // Run timer so that the "wait until" logic times out.
        // Note, we don't run them async because otherwise vitest
        // treats the error as an unhandled promise rejection
        // when instead we want to actually catch it in this test.
        vi.runAllTimers();

        // Now await the connect promise, which will reject due to timeout.
        await socketDataPromise;

        expect.unreachable('it should throw an error');
      } catch (error) {
        expect(error).toEqual(new Error('[GAME:SOCKET:CONNECT:TIMEOUT] 5000'));
      }
    });

    it('throws error if socket is destroyed during connect', async () => {
      const socket = new GameSocketImpl({ credentials });

      // ---

      try {
        // Connect to socket and begin listening for data.
        const socketDataPromise = socket.connect();

        // Before the connect logic has a chance to know if the
        // socket has connected, issue a disconnect to flag it as destroyed.
        await socket.disconnect();

        // Run timer so that the "wait until" logic runs.
        // Note, we don't run them async because otherwise vitest
        // treats the error as an unhandled promise rejection
        // when instead we want to actually catch it in this test.
        vi.runAllTimers();

        // Now await the connect promise, which will reject due to destroyed.
        await socketDataPromise;

        expect.unreachable('it should throw an error');
      } catch (error) {
        expect(error).toEqual(
          new Error(
            '[GAME:SOCKET:STATUS:DESTROYED] failed to connect to game server'
          )
        );
      }
    });
  });

  describe('#disconnect', () => {
    it('disconnects from the game server', async () => {
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

      // Run timer so that the delayed newlines sent on connect are seen.
      await vi.runAllTimersAsync();

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

      await socket.disconnect();

      expect(onConnectSpy).toHaveBeenCalledTimes(1);
      expect(onDisconnectSpy).toHaveBeenCalledTimes(2);

      expect(onDisconnectSpy).toHaveBeenNthCalledWith(1, 'end', undefined);
      expect(onDisconnectSpy).toHaveBeenNthCalledWith(2, 'close', undefined);

      expect(mockSocket.pauseSpy).toHaveBeenCalledTimes(1);
      expect(mockSocket.destroySoonSpy).toHaveBeenCalledTimes(1);
    });

    it('disconnects from the game server when an error occurs', async () => {
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

      // Run timer so that the delayed newlines sent on connect are seen.
      await vi.runAllTimersAsync();

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

      // Run timer so that the delayed newlines sent on connect are seen.
      await vi.runAllTimersAsync();

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

      // Since we never connected then nothing should happen here.
      await socket.disconnect();

      expect(onConnectSpy).toHaveBeenCalledTimes(0);
      expect(onDisconnectSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe('#send', () => {
    it('sends commands when connected to the game server', async () => {
      const socket = new GameSocketImpl({
        credentials,
      });

      // ---

      // Connect to socket and begin listening for data.
      const socketDataPromise = socket.connect();

      // At this point the socket is listening for data from the game server.
      // Emit data from the game server signaling that the connection is ready.
      mockSocket.emitData('<mode id="GAME"/>\n');

      // Run timer so that the delayed newlines sent on connect are seen.
      await vi.runAllTimersAsync();

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

      socket.send('test-command');

      expect(mockSocket.writeSpy).toHaveBeenCalledWith('test-command\n');
    });

    it('throws error when never connected to the game server', async () => {
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

      // Run timer so that the delayed newlines sent on connect are seen.
      await vi.runAllTimersAsync();

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
      const socket = new GameSocketImpl({
        credentials,
      });

      // ---

      // Connect to socket and begin listening for data.
      const socketDataPromise = socket.connect();

      // At this point the socket is listening for data from the game server.
      // Emit data from the game server signaling that the connection is ready.
      mockSocket.emitData('<mode id="GAME"/>\n');

      // Run timer so that the delayed newlines sent on connect are seen.
      await vi.runAllTimersAsync();

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
