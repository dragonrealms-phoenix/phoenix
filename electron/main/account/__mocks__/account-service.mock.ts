import type { Mocked } from 'vitest';
import { vi } from 'vitest';
import type { AccountService } from '../types.js';

export class AccountServiceMockImpl implements Mocked<AccountService> {
  constructorSpy = vi.fn();

  constructor(...args: Array<any>) {
    this.constructorSpy(args);
  }

  listAccounts = vi.fn<AccountService['listAccounts']>();
  getAccount = vi.fn<AccountService['getAccount']>();
  saveAccount = vi.fn<AccountService['saveAccount']>();
  removeAccount = vi.fn<AccountService['removeAccount']>();
  listCharacters = vi.fn<AccountService['listCharacters']>();
  getCharacter = vi.fn<AccountService['getCharacter']>();
  saveCharacter = vi.fn<AccountService['saveCharacter']>();
  removeCharacter = vi.fn<AccountService['removeCharacter']>();
}
