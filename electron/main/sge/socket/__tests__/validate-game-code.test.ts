import type tls from 'node:tls';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TLSSocketMock } from '../../../__mocks__/tls-socket.mock.js';
import { mockTLSConnect } from '../../../__mocks__/tls-socket.mock.js';
import type { SGEGameCode } from '../../types.js';
import { validateGameCode } from '../validate-game-code.js';

const { mockListAvailableGames, mockSendAndReceive } = vi.hoisted(() => {
  const mockListAvailableGames = vi.fn();
  const mockSendAndReceive = vi.fn();

  return {
    mockListAvailableGames,
    mockSendAndReceive,
  };
});

vi.mock('../list-available-games.js', () => {
  return {
    listAvailableGames: mockListAvailableGames,
  };
});

vi.mock('../../../tls/send-and-receive.js', () => {
  return {
    sendAndReceive: mockSendAndReceive,
  };
});

describe('validate-game-code', () => {
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

  describe('#validateGameCode', () => {
    it('resolves when game code is available', async () => {
      mockListAvailableGames.mockResolvedValueOnce([
        {
          code: 'test-game-code',
          name: 'test-game-name',
        },
      ]);

      await validateGameCode({
        socket: mockSocket,
        gameCode: 'test-game-code' as SGEGameCode,
      });
    });

    it('rejects when game code is not available', async () => {
      mockListAvailableGames.mockResolvedValueOnce([
        {
          code: 'test-game-code',
          name: 'test-game-name',
        },
      ]);

      await expect(
        validateGameCode({
          socket: mockSocket,
          gameCode: 'not-found' as SGEGameCode,
        })
      ).rejects.toThrow('[SGE:LOGIN:ERROR:GAME_NOT_FOUND] not-found');
    });
  });
});
