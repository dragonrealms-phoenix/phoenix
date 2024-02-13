import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AccountServiceMockImpl } from '../../../account/__mocks__/account-service.mock.js';
import { removeCharacterHandler } from '../remove-character.js';

describe('remove-character', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#removeCharacterHandler', async () => {
    it('removes a character with an account service', async () => {
      const mockAccountService = new AccountServiceMockImpl();

      const handler = removeCharacterHandler({
        accountService: mockAccountService,
      });

      await handler([
        {
          accountName: 'test-account-name',
          characterName: 'test-character-name',
          gameCode: 'test-game-code',
        },
      ]);

      expect(mockAccountService.removeCharacter).toHaveBeenCalledWith({
        accountName: 'test-account-name',
        characterName: 'test-character-name',
        gameCode: 'test-game-code',
      });
    });
  });
});
