import type tls from 'node:tls';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GameCode } from '../../../../common/game/types.js';
import type { TLSSocketMock } from '../../../__mocks__/tls-socket.mock.js';
import { mockTLSConnect } from '../../../__mocks__/tls-socket.mock.js';
import { getGameSubscription } from '../get-game-subscription.js';

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

describe('get-game-subscription', () => {
  let mockSocket: TLSSocketMock & tls.TLSSocket;

  const gameCode = GameCode.PRIME;

  const socketRequest = Buffer.from(`G\t${gameCode}`);

  beforeEach(() => {
    mockSocket = mockTLSConnect('test');

    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#getGameSubscription', () => {
    it('gets game subscription', async () => {
      const gameName = 'test-game-name';
      const gameStatus = 'test-game-status';

      const socketResponse = Buffer.from(`G\t${gameName}\t${gameStatus}\t`);
      mockSendAndReceive.mockResolvedValueOnce(socketResponse);

      const gameSubscription = await getGameSubscription({
        socket: mockSocket,
        gameCode,
      });

      expect(mockSendAndReceive).toHaveBeenCalledWith({
        socket: mockSocket,
        payload: socketRequest,
      });

      expect(gameSubscription).toEqual({
        game: {
          name: gameName,
          code: gameCode,
        },
        status: gameStatus,
      });
    });

    it('throws an error if the socket returns a problem response', async () => {
      const socketResponse = Buffer.from('X\tPROBLEM');
      mockSendAndReceive.mockResolvedValueOnce(socketResponse);

      await expect(
        getGameSubscription({
          socket: mockSocket,
          gameCode,
        })
      ).rejects.toThrow(`[SGE:LOGIN:ERROR:SUBSCRIPTION] ${gameCode}`);
    });
  });
});
