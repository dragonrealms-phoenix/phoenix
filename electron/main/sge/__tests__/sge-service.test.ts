import type tls from 'node:tls';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TLSSocketMock } from '../../__mocks__/tls-socket.mock.js';
import { mockTLSConnect } from '../../__mocks__/tls-socket.mock.js';
import { SGEServiceImpl } from '../sge.service.js';
import type { SGECharacter, SGEGameCredentials, SGEService } from '../types.js';
import { SGEGameCode } from '../types.js';

const {
  mockConnect,
  mockAuthenticate,
  mockValidateGameCode,
  mockGetGameCredentials,
  mockGetGameSubscription,
  mockListAvailableCharacters,
} = vi.hoisted(() => {
  const mockConnect = vi.fn();
  const mockAuthenticate = vi.fn();
  const mockValidateGameCode = vi.fn();
  const mockGetGameCredentials = vi.fn();
  const mockGetGameSubscription = vi.fn();
  const mockListAvailableCharacters = vi.fn();

  return {
    mockConnect,
    mockAuthenticate,
    mockValidateGameCode,
    mockGetGameCredentials,
    mockGetGameSubscription,
    mockListAvailableCharacters,
  };
});

vi.mock('../socket/connect.js', () => {
  return {
    connect: mockConnect,
  };
});

vi.mock('../socket/authenticate.js', () => {
  return {
    authenticate: mockAuthenticate,
  };
});

vi.mock('../socket/validate-game-code.js', () => {
  return {
    validateGameCode: mockValidateGameCode,
  };
});

vi.mock('../socket/get-game-credentials.js', () => {
  return {
    getGameCredentials: mockGetGameCredentials,
  };
});

vi.mock('../socket/get-game-subscription.js', () => {
  return {
    getGameSubscription: mockGetGameSubscription,
  };
});

vi.mock('../socket/list-available-characters.js', () => {
  return {
    listAvailableCharacters: mockListAvailableCharacters,
  };
});

describe('sge-service', () => {
  let mockSocket: TLSSocketMock & tls.TLSSocket;

  let sgeService: SGEService;

  beforeEach(() => {
    mockSocket = mockTLSConnect('test');
    mockConnect.mockResolvedValueOnce(mockSocket);

    sgeService = new SGEServiceImpl({
      username: 'test-username',
      password: 'test-password',
      gameCode: SGEGameCode.DRAGONREALMS_PRIME,
    });

    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#loginCharacter', () => {
    it('gets game credentials to play the character', async () => {
      const mockGameCredentials: SGEGameCredentials = {
        host: 'test-host',
        port: 1234,
        accessToken: 'test-access-token',
      };

      mockGetGameCredentials.mockResolvedValueOnce(mockGameCredentials);

      const credentials = await sgeService.loginCharacter(
        'test-character-name'
      );

      expect(credentials).toEqual(mockGameCredentials);

      expect(mockConnect).toHaveBeenCalledTimes(1);

      expect(mockAuthenticate).toHaveBeenCalledWith({
        socket: mockSocket,
        username: 'test-username',
        password: 'test-password',
      });

      expect(mockValidateGameCode).toHaveBeenCalledWith({
        socket: mockSocket,
        gameCode: SGEGameCode.DRAGONREALMS_PRIME,
      });

      expect(mockGetGameSubscription).toHaveBeenCalledWith({
        socket: mockSocket,
        gameCode: SGEGameCode.DRAGONREALMS_PRIME,
      });

      expect(mockGetGameCredentials).toHaveBeenCalledWith({
        socket: mockSocket,
        characterName: 'test-character-name',
      });

      expect(mockSocket.destroySoonSpy).toHaveBeenCalledTimes(1);
    });

    it('throws an error if there is an error getting game credentials', async () => {
      const mockError = new Error('test-error');
      mockAuthenticate.mockRejectedValueOnce(mockError);

      await expect(
        sgeService.loginCharacter('test-character-name')
      ).rejects.toThrow(mockError);

      expect(mockConnect).toHaveBeenCalledTimes(1);

      expect(mockSocket.destroySoonSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('#listCharacters', () => {
    it('gets list of available characters to play', async () => {
      const mockCharacters: Array<SGECharacter> = [
        {
          id: 'test-character-id-1',
          name: 'test-character-name-1',
        },
        {
          id: 'test-character-id-2',
          name: 'test-character-name-2',
        },
      ];

      mockListAvailableCharacters.mockResolvedValueOnce(mockCharacters);

      const characters = await sgeService.listCharacters();

      expect(characters).toEqual(mockCharacters);

      expect(mockConnect).toHaveBeenCalledTimes(1);

      expect(mockAuthenticate).toHaveBeenCalledWith({
        socket: mockSocket,
        username: 'test-username',
        password: 'test-password',
      });

      expect(mockValidateGameCode).toHaveBeenCalledWith({
        socket: mockSocket,
        gameCode: SGEGameCode.DRAGONREALMS_PRIME,
      });

      expect(mockGetGameSubscription).toHaveBeenCalledWith({
        socket: mockSocket,
        gameCode: SGEGameCode.DRAGONREALMS_PRIME,
      });

      expect(mockListAvailableCharacters).toHaveBeenCalledWith({
        socket: mockSocket,
      });

      expect(mockSocket.destroySoonSpy).toHaveBeenCalledTimes(1);
    });

    it('throws an error if there is an error getting characters', async () => {
      const mockError = new Error('test-error');
      mockAuthenticate.mockRejectedValueOnce(mockError);

      await expect(sgeService.listCharacters()).rejects.toThrow(mockError);

      expect(mockConnect).toHaveBeenCalledTimes(1);

      expect(mockSocket.destroySoonSpy).toHaveBeenCalledTimes(1);
    });
  });
});
