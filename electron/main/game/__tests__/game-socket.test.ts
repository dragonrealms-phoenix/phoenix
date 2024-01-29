import * as net from 'node:net';
import type { Mock } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sleep } from '../../../common/async/sleep.js';
import type { SGEGameCredentials } from '../../sge/types.js';
import { NetSocketMock } from '../__mocks__/net-socket.mock.js';
import { GameSocketImpl } from '../game.socket.js';
import type { GameSocket } from '../types.js';

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
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe('#connect', () => {
    it('should connect to the game server, receive messages, and then disconnect', async () => {
      vi.spyOn(net, 'connect').mockImplementation(mockNetConnect());

      const onConnectSpy = vi.fn();
      const onDisconnectSpy = vi.fn();

      socket = new GameSocketImpl({
        credentials,
        onConnect: onConnectSpy,
        onDisconnect: onDisconnectSpy,
      });

      // ---

      const socketData$ = await socket.connect();

      // first subscriber
      socketData$.subscribe({
        next: subscriber1NextSpy,
        error: subscriber1ErrorSpy,
        complete: subscriber1CompleteSpy,
      });

      await sleep(1000);

      // second subscriber
      socketData$.subscribe({
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
      vi.spyOn(net, 'connect').mockImplementation(mockNetConnect());

      const onConnectSpy = vi.fn();
      const onDisconnectSpy = vi.fn();

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

      vi.clearAllMocks();

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
      vi.spyOn(net, 'connect').mockImplementation(mockNetConnect());

      const onConnectSpy = vi.fn();
      const onDisconnectSpy = vi.fn();

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
      expect(mockSockets[0].writeSpy).toHaveBeenNthCalledWith(
        1,
        'test-token\n'
      );
      expect(mockSockets[0].writeSpy).toHaveBeenNthCalledWith(
        2,
        `FE:WRAYTH /VERSION:1.0.1.26 /P:${process.platform.toUpperCase()} /XML\n`
      );
      expect(mockSockets[0].writeSpy).toHaveBeenNthCalledWith(3, `\n\n`);
    });
  });

  describe('#disconnect', () => {
    it('should disconnect from the game server', async () => {
      vi.spyOn(net, 'connect').mockImplementation(mockNetConnect());

      const onConnectSpy = vi.fn();
      const onDisconnectSpy = vi.fn();

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
      vi.spyOn(net, 'connect').mockImplementation(
        mockNetConnect({
          emitError: true,
        })
      );

      const onConnectSpy = vi.fn();
      const onDisconnectSpy = vi.fn();

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
      vi.spyOn(net, 'connect').mockImplementation(
        mockNetConnect({
          emitTimeout: true,
        })
      );

      const onConnectSpy = vi.fn();
      const onDisconnectSpy = vi.fn();

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
      vi.spyOn(net, 'connect').mockImplementation(mockNetConnect());

      const onConnectSpy = vi.fn();
      const onDisconnectSpy = vi.fn();

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
      vi.spyOn(net, 'connect').mockImplementation(mockNetConnect());

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
      vi.spyOn(net, 'connect').mockImplementation(mockNetConnect());

      socket = new GameSocketImpl({
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

    it('should throw error when socket is not writable', async () => {
      vi.spyOn(net, 'connect').mockImplementation(
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
        expect.unreachable('it should throw an error');
      } catch (error) {
        expect(error).toEqual(
          new Error(
            `[GAME:SOCKET:STATUS:NOT_WRITABLE] cannot send commands: test-command`
          )
        );
      }
    });

    it('should throw error when socket has been disconnected', async () => {
      vi.spyOn(net, 'connect').mockImplementation(mockNetConnect());

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
