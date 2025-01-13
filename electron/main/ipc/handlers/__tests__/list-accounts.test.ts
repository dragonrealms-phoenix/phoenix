import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AccountServiceMockImpl } from '../../../account/__mocks__/account-service.mock.js';
import type { ListAccountsItemType } from '../../../account/types.js';
import { listAccountsHandler } from '../list-accounts.js';

vi.mock('../../../logger/logger.factory.ts');

describe('list-accounts', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#listAccountsHandler', async () => {
    it('lists accounts', async () => {
      const mockAccountService = new AccountServiceMockImpl();

      const mockAccount: ListAccountsItemType = {
        accountName: 'test-account-name',
      };

      mockAccountService.listAccounts.mockResolvedValueOnce([mockAccount]);

      const handler = listAccountsHandler({
        accountService: mockAccountService,
      });

      const accounts = await handler([]);

      expect(accounts).toEqual([mockAccount]);
    });
  });
});
