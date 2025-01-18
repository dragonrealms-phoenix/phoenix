import type tls from 'node:tls';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TLSSocketMock } from '../../../__mocks__/tls-socket.mock.js';
import { mockTLSConnect } from '../../../__mocks__/tls-socket.mock.js';
import type { SGECharacter } from '../../types.js';
import { getCharacterId } from '../get-character-id.js';

const { mockListAvailableCharacters } = vi.hoisted(() => {
  const mockListAvailableCharacters = vi.fn();

  return {
    mockListAvailableCharacters,
  };
});

vi.mock('../list-available-characters.js', () => {
  return {
    listAvailableCharacters: mockListAvailableCharacters,
  };
});

vi.mock('../../../logger/logger.factory.ts');

describe('get-character-id', () => {
  let mockSocket: TLSSocketMock & tls.TLSSocket;

  const mockCharacter: SGECharacter = {
    id: '1',
    name: 'test',
  };

  beforeEach(() => {
    mockSocket = mockTLSConnect('test');

    mockListAvailableCharacters.mockResolvedValueOnce([mockCharacter]);

    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#getCharacterId', async () => {
    it('returns the character id', async () => {
      const characterId = await getCharacterId({
        socket: mockSocket,
        characterName: mockCharacter.name,
      });

      expect(characterId).toBe(mockCharacter.id);
    });

    it('returns undefined if the character does not exist', async () => {
      const characterId = await getCharacterId({
        socket: mockSocket,
        characterName: 'not-found',
      });

      expect(characterId).toBe(undefined);
    });
  });
});
