import type tls from 'node:tls';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TLSSocketMock } from '../../../__mocks__/tls-socket.mock.js';
import { mockTLSConnect } from '../../../__mocks__/tls-socket.mock.js';
import { authenticate } from '../authenticate.js';

const { mockHashPassword, mockSendAndReceive } = vi.hoisted(() => {
  const mockHashPassword = vi.fn();
  const mockSendAndReceive = vi.fn();

  return {
    mockHashPassword,
    mockSendAndReceive,
  };
});

vi.mock('../hash-password.js', () => {
  return {
    hashPassword: mockHashPassword,
  };
});

vi.mock('../../../tls/send-and-receive.js', () => {
  return {
    sendAndReceive: mockSendAndReceive,
  };
});

describe('authenticate', () => {
  let mockSocket: TLSSocketMock & tls.TLSSocket;

  const username = 'test-username';
  const password = 'test-password';
  const hashedPassword = 'test-hashed-password';

  const socketRequest = Buffer.concat([
    Buffer.from(`A\t${username.toUpperCase()}\t`),
    Buffer.from(hashedPassword),
  ]);

  beforeEach(() => {
    mockSocket = mockTLSConnect('test');

    mockHashPassword.mockResolvedValueOnce(Buffer.from(hashedPassword));

    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#authenticate', () => {
    it('authenticates and receives api key', async () => {
      const apiKey = 'test-api-key';
      const socketResponse = Buffer.from(`A\t${username}\tKEY\t${apiKey}\t`);
      mockSendAndReceive.mockResolvedValueOnce(socketResponse);

      await authenticate({
        socket: mockSocket,
        username,
        password,
      });

      expect(mockHashPassword).toHaveBeenCalledWith({
        socket: mockSocket,
        password,
      });

      expect(mockSendAndReceive).toHaveBeenCalledWith({
        socket: mockSocket,
        payload: socketRequest,
      });
    });

    it('fails to authenticate with username and throws error', async () => {
      const socketResponse = Buffer.from(`A\t\tNORECORD`);
      mockSendAndReceive.mockResolvedValueOnce(socketResponse);

      await expect(
        authenticate({
          socket: mockSocket,
          username,
          password,
        })
      ).rejects.toThrowError('[SGE:LOGIN:ERROR:AUTHENTICATION] NORECORD');

      expect(mockHashPassword).toHaveBeenCalledWith({
        socket: mockSocket,
        password,
      });

      expect(mockSendAndReceive).toHaveBeenCalledWith({
        socket: mockSocket,
        payload: socketRequest,
      });
    });

    it('fails to authenticate with password and throws error', async () => {
      const socketResponse = Buffer.from(`A\t\tPASSWORD`);
      mockSendAndReceive.mockResolvedValueOnce(socketResponse);

      await expect(
        authenticate({
          socket: mockSocket,
          username,
          password,
        })
      ).rejects.toThrowError('[SGE:LOGIN:ERROR:AUTHENTICATION] PASSWORD');

      expect(mockHashPassword).toHaveBeenCalledWith({
        socket: mockSocket,
        password,
      });

      expect(mockSendAndReceive).toHaveBeenCalledWith({
        socket: mockSocket,
        payload: socketRequest,
      });
    });

    it('fails to authenticate for unknown reason and throws error', async () => {
      const socketResponse = Buffer.from(`?`);
      mockSendAndReceive.mockResolvedValueOnce(socketResponse);

      await expect(
        authenticate({
          socket: mockSocket,
          username,
          password,
        })
      ).rejects.toThrowError('[SGE:LOGIN:ERROR:AUTHENTICATION] ?');

      expect(mockHashPassword).toHaveBeenCalledWith({
        socket: mockSocket,
        password,
      });

      expect(mockSendAndReceive).toHaveBeenCalledWith({
        socket: mockSocket,
        payload: socketRequest,
      });
    });
  });
});
