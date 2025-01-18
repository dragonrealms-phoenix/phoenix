import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Character } from '../../../../common/account/types.js';
import { AccountServiceMockImpl } from '../../../account/__mocks__/account-service.mock.js';
import { listCharactersHandler } from '../list-characters.js';

vi.mock('../../../logger/logger.factory.ts');

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
    it('lists characters', async () => {
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
