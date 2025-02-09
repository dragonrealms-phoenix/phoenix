import { afterEach, describe, expect, it, vi } from 'vitest';
import { StoreServiceMockImpl } from '../../store/__mocks__/store-service.mock.js';
import { AccountServiceImpl } from '../account.service.js';

vi.mock('../../store/store.instance.ts', () => {
  return { Store: new StoreServiceMockImpl() };
});

vi.mock('../../logger/logger.factory.ts');

describe('account-instance', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  it('is an account service', async () => {
    const Accounts = (await import('../account.instance.js')).Accounts;
    expect(Accounts).toBeInstanceOf(AccountServiceImpl);
  });
});
