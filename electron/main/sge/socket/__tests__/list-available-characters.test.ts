import type * as tls from 'node:tls';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TLSSocketMock } from '../../../__mocks__/tls-socket.mock.js';
import { mockTLSConnect } from '../../../__mocks__/tls-socket.mock.js';
import { listAvailableCharacters } from '../list-available-characters.js';

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

describe('list-available-characters', () => {
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

  describe('#listAvailableCharacters', () => {
    it('returns the available characters to play', async () => {
      const characterId1 = 'test-character-id-1';
      const characterName1 = 'test-character-name-1';

      const characterId2 = 'test-character-id-2';
      const characterName2 = 'test-character-name-2';

      mockSendAndReceive.mockResolvedValueOnce(
        Buffer.from(
          `C\t1\t2\t3\t4\t${characterId1}\t${characterName1}\t${characterId2}\t${characterName2}`
        )
      );

      const characters = await listAvailableCharacters({ socket: mockSocket });

      expect(characters.length).toBe(2);

      expect(characters).toEqual([
        {
          id: characterId1,
          name: characterName1,
        },
        {
          id: characterId2,
          name: characterName2,
        },
      ]);

      expect(mockSendAndReceive).toHaveBeenCalledWith({
        socket: mockSocket,
        payload: Buffer.from(`C`),
      });
    });

    it('returns empty list when no characters to play', async () => {
      mockSendAndReceive.mockResolvedValueOnce(Buffer.from(`C\t1\t2\t3\t4\t`));

      const characters = await listAvailableCharacters({ socket: mockSocket });

      expect(characters.length).toBe(0);

      expect(mockSendAndReceive).toHaveBeenCalledWith({
        socket: mockSocket,
        payload: Buffer.from(`C`),
      });
    });
  });
});
