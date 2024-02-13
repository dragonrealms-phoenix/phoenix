import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AccountServiceMockImpl } from '../../../account/__mocks__/account-service.mock.js';
import { removeAccountHandler } from '../remove-account.js';

describe('remove-account', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#removeAccountHandler', async () => {
    it('removes an account with an account service', async () => {
      const mockAccountService = new AccountServiceMockImpl();

      const handler = removeAccountHandler({
        accountService: mockAccountService,
      });

      await handler([
        {
          accountName: 'test-account-name',
        },
      ]);

      expect(mockAccountService.removeAccount).toHaveBeenCalledWith({
        accountName: 'test-account-name',
      });
    });
  });
});
