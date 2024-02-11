import type * as tls from 'node:tls';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TLSSocketMock } from '../../../__mocks__/tls-socket.mock.js';
import { mockTLSConnect } from '../../../__mocks__/tls-socket.mock.js';
import { SGEGameProtocol } from '../../types.js';
import { getGameCredentials } from '../get-game-credentials.js';

const { mockGetCharacterId, mockSendAndReceive } = vi.hoisted(() => {
  const mockGetCharacterId = vi.fn();
  const mockSendAndReceive = vi.fn();

  return {
    mockGetCharacterId,
    mockSendAndReceive,
  };
});

vi.mock('../get-character-id.js', () => {
  return {
    getCharacterId: mockGetCharacterId,
  };
});

vi.mock('../../../tls/send-and-receive.js', () => {
  return {
    sendAndReceive: mockSendAndReceive,
  };
});

describe('get-game-credentials', () => {
  let mockSocket: TLSSocketMock & tls.TLSSocket;

  const characterName = 'test-character-name';
  const characterId = 'test-character-id';

  const socketRequest = Buffer.from(
    `L\t${characterId}\t${SGEGameProtocol.STORMFRONT}`
  );

  beforeEach(() => {
    mockSocket = mockTLSConnect('test');

    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#getGameCredentials', () => {
    it('gets game credentials to play the character', async () => {
      const gameHost = 'test-game-host';
      const gamePort = 11024;
      const gameKey = 'test-game-key';

      mockGetCharacterId.mockResolvedValue(characterId);

      const socketResponse = Buffer.from(
        `L\tOK\tUPPORT=5535\tGAME=STORM\tGAMECODE=DR\tFULLGAMENAME=Wrayth\tGAMEFILE=WRAYTH.EXE\tGAMEHOST=${gameHost}\tGAMEPORT=${gamePort}\tKEY=${gameKey}`
      );
      mockSendAndReceive.mockResolvedValue(socketResponse);

      const gameCredentials = await getGameCredentials({
        socket: mockSocket,
        characterName,
      });

      expect(mockGetCharacterId).toHaveBeenCalledWith({
        socket: mockSocket,
        characterName,
      });

      expect(mockSendAndReceive).toHaveBeenCalledWith({
        socket: mockSocket,
        payload: socketRequest,
      });

      expect(gameCredentials).toEqual({
        host: gameHost,
        port: gamePort,
        accessToken: gameKey,
      });
    });

    it('throws an error if the character does not exist', async () => {
      mockGetCharacterId.mockResolvedValue(undefined);

      await expect(
        getGameCredentials({
          socket: mockSocket,
          characterName,
        })
      ).rejects.toThrow(
        `[SGE:LOGIN:ERROR:CHARACTER_NOT_FOUND] ${characterName}`
      );
    });

    it('throws an error if the socket does not return game credentials', async () => {
      mockGetCharacterId.mockResolvedValue(characterId);

      const socketResponse = Buffer.from('L\tPROBLEM\t1');
      mockSendAndReceive.mockResolvedValue(socketResponse);

      await expect(
        getGameCredentials({
          socket: mockSocket,
          characterName,
        })
      ).rejects.toThrow(`[SGE:LOGIN:ERROR:SUBSCRIPTION] PROBLEM`);
    });

    it('throws an error if the game host is not parsed from the socket response', async () => {
      const gameHost = 'test-game-host';
      const gamePort = 11024;
      const gameKey = 'test-game-key';

      mockGetCharacterId.mockResolvedValue(characterId);

      // To break the parsing, I changed `=` to `<>` in the response.
      const socketResponse = Buffer.from(
        `L\tOK\tUPPORT=5535\tGAME=STORM\tGAMECODE=DR\tFULLGAMENAME=Wrayth\tGAMEFILE=WRAYTH.EXE\tGAMEHOST<>${gameHost}\tGAMEPORT=${gamePort}\tKEY=${gameKey}`
      );
      mockSendAndReceive.mockResolvedValue(socketResponse);

      await expect(
        getGameCredentials({
          socket: mockSocket,
          characterName,
        })
      ).rejects.toThrow(
        `[SGE:LOGIN:ERROR:PARSE_GAME_CREDENTIALS] ${characterName}`
      );
    });

    it('throws an error if the game port is not parsed from the socket response', async () => {
      const gameHost = 'test-game-host';
      const gamePort = 11024;
      const gameKey = 'test-game-key';

      mockGetCharacterId.mockResolvedValue(characterId);

      // To break the parsing, I changed `=` to `<>` in the response.
      const socketResponse = Buffer.from(
        `L\tOK\tUPPORT=5535\tGAME=STORM\tGAMECODE=DR\tFULLGAMENAME=Wrayth\tGAMEFILE=WRAYTH.EXE\tGAMEHOST=${gameHost}\tGAMEPORT<>${gamePort}\tKEY=${gameKey}`
      );
      mockSendAndReceive.mockResolvedValue(socketResponse);

      await expect(
        getGameCredentials({
          socket: mockSocket,
          characterName,
        })
      ).rejects.toThrow(
        `[SGE:LOGIN:ERROR:PARSE_GAME_CREDENTIALS] ${characterName}`
      );
    });

    it('throws an error if the game key is not parsed from the socket response', async () => {
      const gameHost = 'test-game-host';
      const gamePort = 11024;
      const gameKey = 'test-game-key';

      mockGetCharacterId.mockResolvedValue(characterId);

      // To break the parsing, I changed `=` to `<>` in the response.
      const socketResponse = Buffer.from(
        `L\tOK\tUPPORT=5535\tGAME=STORM\tGAMECODE=DR\tFULLGAMENAME=Wrayth\tGAMEFILE=WRAYTH.EXE\tGAMEHOST=${gameHost}\tGAMEPORT=${gamePort}\tKEY<>${gameKey}`
      );
      mockSendAndReceive.mockResolvedValue(socketResponse);

      await expect(
        getGameCredentials({
          socket: mockSocket,
          characterName,
        })
      ).rejects.toThrow(
        `[SGE:LOGIN:ERROR:PARSE_GAME_CREDENTIALS] ${characterName}`
      );
    });
  });
});
