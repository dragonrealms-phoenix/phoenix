import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AccountServiceMockImpl } from '../../../account/__mocks__/account-service.mock.js';
import { saveAccountHandler } from '../save-account.js';

vi.mock('../../../logger/logger.factory.ts');

describe('save-account', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#saveAccountHandler', async () => {
    it('saves an account', async () => {
      const mockAccountService = new AccountServiceMockImpl();

      const handler = saveAccountHandler({
        accountService: mockAccountService,
      });

      await handler([
        {
          accountName: 'test-account-name',
          accountPassword: 'test-account-password',
        },
      ]);

      expect(mockAccountService.saveAccount).toHaveBeenCalledWith({
        accountName: 'test-account-name',
        accountPassword: 'test-account-password',
      });
    });
  });
});
