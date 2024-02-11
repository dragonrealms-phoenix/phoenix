import type * as tls from 'node:tls';
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

describe('get-character-id', () => {
  let mockSocket: TLSSocketMock & tls.TLSSocket;

  beforeEach(() => {
    mockSocket = mockTLSConnect('test');

    const characters = new Array<SGECharacter>({ id: '1', name: 'test' });
    mockListAvailableCharacters.mockResolvedValue(characters);

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
        characterName: 'test',
      });

      expect(characterId).toBe('1');
    });

    it('returns undefined if the character does not exist', async () => {
      const characterId = await getCharacterId({
        socket: mockSocket,
        characterName: 'not-found',
      });

      expect(characterId).toBeUndefined();
    });
  });
});