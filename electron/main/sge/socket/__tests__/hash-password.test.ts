import type tls from 'node:tls';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TLSSocketMock } from '../../../__mocks__/tls-socket.mock.js';
import { mockTLSConnect } from '../../../__mocks__/tls-socket.mock.js';
import { sendAndReceive } from '../../../tls/send-and-receive.js';
import {
  getPasswordHashSalt,
  hashPassword,
  hashPasswordWithSalt,
} from '../hash-password.js';

const { mockSendAndReceive } = vi.hoisted(() => {
  const mockSendAndReceive = vi.fn();

  return {
    mockSendAndReceive,
  };
});

vi.mock('../../../tls/send-and-receive.js', () => {
  return {
    sendAndReceive: mockSendAndReceive,
  };
});

vi.mock('../../../logger/logger.factory.ts');

describe('hash-password', () => {
  let mockSocket: TLSSocketMock & tls.TLSSocket;

  const password = 'test-password';
  const hashSalt = 'test-salt';

  // Computed by running the actual `hashPasswordWithSalt` function.
  const hashedPasswordHex = '404040404043405f47';

  beforeEach(() => {
    mockSocket = mockTLSConnect('test');

    mockSendAndReceive.mockResolvedValueOnce(Buffer.from(hashSalt));

    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#hashPassword', () => {
    it('hashes the password with the salt', async () => {
      const hashedPassword = await hashPassword({
        socket: mockSocket,
        password,
      });

      expect(hashedPassword.toString('hex')).toBe(hashedPasswordHex);
    });
  });

  describe('#getPasswordHashSalt', async () => {
    it('gets the password hash salt', async () => {
      const passwordHashSalt = await getPasswordHashSalt({
        socket: mockSocket,
      });

      expect(passwordHashSalt).toBe(hashSalt);

      expect(sendAndReceive).toHaveBeenCalledWith({
        socket: mockSocket,
        payload: Buffer.from('K'),
      });
    });
  });

  describe('#hashPasswordWithSalt', () => {
    it('hashes the password with the salt', async () => {
      const hashedPassword = hashPasswordWithSalt({ password, hashSalt });

      expect(hashedPassword.toString('hex')).toBe(hashedPasswordHex);

      expect(hashedPassword.length).toBe(
        Math.min(password.length, hashSalt.length)
      );
    });
  });
});
