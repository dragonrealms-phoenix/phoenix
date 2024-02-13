import { vi } from 'vitest';
import type { AccountService } from '../types.js';

export class AccountServiceMockImpl implements AccountService {
  listAccounts = vi.fn<
    Parameters<AccountService['listAccounts']>,
    ReturnType<AccountService['listAccounts']>
  >();

  getAccount = vi.fn<
    Parameters<AccountService['getAccount']>,
    ReturnType<AccountService['getAccount']>
  >();

  saveAccount = vi.fn<
    Parameters<AccountService['saveAccount']>,
    ReturnType<AccountService['saveAccount']>
  >();

  removeAccount = vi.fn<
    Parameters<AccountService['removeAccount']>,
    ReturnType<AccountService['removeAccount']>
  >();

  listCharacters = vi.fn<
    Parameters<AccountService['listCharacters']>,
    ReturnType<AccountService['listCharacters']>
  >();

  getCharacter = vi.fn<
    Parameters<AccountService['getCharacter']>,
    ReturnType<AccountService['getCharacter']>
  >();

  saveCharacter = vi.fn<
    Parameters<AccountService['saveCharacter']>,
    ReturnType<AccountService['saveCharacter']>
  >();

  removeCharacter = vi.fn<
    Parameters<AccountService['removeCharacter']>,
    ReturnType<AccountService['removeCharacter']>
  >();
}
