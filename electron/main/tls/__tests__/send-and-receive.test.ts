import type * as tls from 'node:tls';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TLSSocketMock } from '../../__mocks__/tls-socket.mock.js';
import { mockTLSConnect } from '../../__mocks__/tls-socket.mock.js';
import { sendAndReceive } from '../send-and-receive.js';

describe('send-and-receive', () => {
  let mockSocket: TLSSocketMock & tls.TLSSocket;

  beforeEach(() => {
    mockSocket = mockTLSConnect({
      host: 'test-hot',
      port: 1234,
    });

    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#sendAndReceive', () => {
    it('sends a payload and resolves with the response', async () => {
      const payload = Buffer.from('Hello, server!');
      const response = Buffer.from('Hello, client!');

      const promise = sendAndReceive({
        socket: mockSocket,
        payload,
      });

      mockSocket.emitData(response);

      await expect(promise).resolves.toBe(response);
    });

    it('rejects if the socket closes before a response is received', async () => {
      const payload = Buffer.from('Hello, server!');

      const promise = sendAndReceive({
        socket: mockSocket,
        payload,
      });

      mockSocket.destroy();

      await expect(promise).rejects.toThrowError('[TLS:SOCKET:STATUS:CLOSED]');
    });

    it('rejects if the socket times out before a response is received', async () => {
      const payload = Buffer.from('Hello, server!');

      const promise = sendAndReceive({
        socket: mockSocket,
        payload,
        requestTimeout: 1000,
      });

      vi.runAllTimers();

      await expect(promise).rejects.toThrowError(
        '[TLS:SOCKET:REQUEST:TIMEOUT] 1000'
      );
    });

    it('rejects if the socket emits a timeout', async () => {
      mockSocket.timeout = 1000;

      const payload = Buffer.from('Hello, server!');

      const promise = sendAndReceive({
        socket: mockSocket,
        payload,
      });

      mockSocket.emitTimeoutEvent();

      await expect(promise).rejects.toThrowError(
        '[TLS:SOCKET:STATUS:TIMEOUT] 1000'
      );
    });

    it('rejects if the socket emits an error', async () => {
      const payload = Buffer.from('Hello, server!');

      const promise = sendAndReceive({
        socket: mockSocket,
        payload,
      });

      mockSocket.emitErrorEvent();

      await expect(promise).rejects.toThrowError(
        '[TLS:SOCKET:ERROR:ERROR] test'
      );
    });
  });
});
