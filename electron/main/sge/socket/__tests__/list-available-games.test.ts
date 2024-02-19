import type tls from 'node:tls';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TLSSocketMock } from '../../../__mocks__/tls-socket.mock.js';
import { mockTLSConnect } from '../../../__mocks__/tls-socket.mock.js';
import { listAvailableGames } from '../list-available-games.js';

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

describe('list-available-games', () => {
  let mockSocket: TLSSocketMock & tls.TLSSocket;

  beforeEach(() => {
    mockSocket = mockTLSConnect('test');

    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#listAvailableGames', () => {
    it('returns the available games to play', async () => {
      const gameCode1 = 'test-game-code-1';
      const gameName1 = 'test-game-name-1';

      const gameCode2 = 'test-game-code-2';
      const gameName2 = 'test-game-name-2';

      mockSendAndReceive.mockResolvedValueOnce(
        Buffer.from(
          `M\t${gameCode1}\t${gameName1}\t${gameCode2}\t${gameName2}\t`
        )
      );

      const games = await listAvailableGames({ socket: mockSocket });

      expect(games.length).toBe(2);

      expect(games).toEqual([
        {
          code: gameCode1,
          name: gameName1,
        },
        {
          code: gameCode2,
          name: gameName2,
        },
      ]);

      expect(mockSendAndReceive).toHaveBeenCalledWith({
        socket: mockSocket,
        payload: Buffer.from(`M`),
      });
    });

    it('returns empty list when no games to play', async () => {
      mockSendAndReceive.mockResolvedValueOnce(Buffer.from(`M`));

      const games = await listAvailableGames({ socket: mockSocket });

      expect(games.length).toBe(0);

      expect(mockSendAndReceive).toHaveBeenCalledWith({
        socket: mockSocket,
        payload: Buffer.from(`M`),
      });
    });
  });
});
