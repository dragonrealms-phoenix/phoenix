import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AccountServiceMockImpl } from '../../../account/__mocks__/account-service.mock.js';
import type { Character } from '../../../account/types.js';
import { listCharactersHandler } from '../list-characters.js';

describe('list-characters', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#listCharactersHandler', async () => {
    it('lists characters with an account service', async () => {
      const mockAccountService = new AccountServiceMockImpl();

      const mockCharacter: Character = {
        accountName: 'test-account-name',
        characterName: 'test-character-name',
        gameCode: 'test-game-code',
      };

      mockAccountService.listCharacters.mockResolvedValueOnce([mockCharacter]);

      const handler = listCharactersHandler({
        accountService: mockAccountService,
      });

      const characters = await handler([]);

      expect(characters).toEqual([mockCharacter]);
    });
  });
});
