import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AccountServiceMockImpl } from '../../../account/__mocks__/account-service.mock.js';
import { saveCharacterHandler } from '../save-character.js';

describe('save-character', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#saveCharacterHandler', async () => {
    it('saves a character with an account service', async () => {
      const mockAccountService = new AccountServiceMockImpl();

      const handler = saveCharacterHandler({
        accountService: mockAccountService,
      });

      await handler([
        {
          accountName: 'test-account-name',
          characterName: 'test-character-name',
          gameCode: 'test-game-code',
        },
      ]);

      expect(mockAccountService.saveCharacter).toHaveBeenCalledWith({
        accountName: 'test-account-name',
        characterName: 'test-character-name',
        gameCode: 'test-game-code',
      });
    });
  });
});
