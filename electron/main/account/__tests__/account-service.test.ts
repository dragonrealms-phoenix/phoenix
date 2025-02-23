import type { Mocked } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CacheServiceMockImpl } from '../../cache/__mocks__/cache-service.mock.js';
import type { CacheService } from '../../cache/types.js';
import { AccountServiceImpl } from '../account.service.js';
import type { AccountService } from '../types.js';

type ElectronModule = typeof import('electron');

const { mockSafeStorageEncryptString, mockSafeStorageDecryptString } =
  await vi.hoisted(async () => {
    const mockSafeStorageEncryptString = vi.fn();
    const mockSafeStorageDecryptString = vi.fn();

    return {
      mockSafeStorageEncryptString,
      mockSafeStorageDecryptString,
    };
  });

vi.mock('electron', async (importOriginal) => {
  const actualModule = await importOriginal<ElectronModule>();
  return {
    ...actualModule,
    safeStorage: {
      encryptString: mockSafeStorageEncryptString,
      decryptString: mockSafeStorageDecryptString,
    },
  };
});

vi.mock('../../logger/logger.factory.ts');

describe('account-service', () => {
  let mockCacheService: Mocked<CacheService>;
  let accountService: AccountService;

  beforeEach(() => {
    mockSafeStorageEncryptString.mockReturnValueOnce(
      Buffer.from('test-encrypted')
    );

    mockSafeStorageDecryptString.mockReturnValueOnce('test-password');

    mockCacheService = new CacheServiceMockImpl();

    accountService = new AccountServiceImpl({
      cacheService: mockCacheService,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe('#listAccounts', () => {
    it('lists accounts', async () => {
      const mockCache: Record<string, any> = {
        'sge.account.test-account-1': {
          accountName: 'test-account-1',
          accountPassword: 'test-encrypted',
        },
        'sge.account.test-account-2': {
          accountName: 'test-account-2',
          accountPassword: 'test-encrypted',
        },
      };

      mockCacheService.readCache.mockReturnValueOnce(mockCache);

      mockCacheService.get.mockImplementation((key: string) => {
        return mockCache[key];
      });

      const accounts = accountService.listAccounts();

      expect(accounts).toEqual([
        {
          accountName: 'test-account-1',
        },
        {
          accountName: 'test-account-2',
        },
      ]);
    });

    it('returns an empty array if no accounts are found', async () => {
      mockCacheService.readCache.mockReturnValueOnce({});

      const accounts = accountService.listAccounts();

      expect(accounts).toEqual([]);
    });
  });

  describe('#getAccount', () => {
    it('gets an account', async () => {
      mockCacheService.get.mockImplementation((key: string) => {
        if (key === 'sge.account.test-account') {
          return {
            accountName: 'test-account',
            accountPassword: 'test-encrypted',
          };
        }

        return undefined;
      });

      const account = accountService.getAccount({
        accountName: 'test-account',
      });

      expect(account).toEqual({
        accountName: 'test-account',
        accountPassword: 'test-password',
      });
    });

    it('returns undefined if no account is found', async () => {
      mockCacheService.get.mockReturnValueOnce(undefined);

      const account = accountService.getAccount({
        accountName: 'test-account',
      });

      expect(account).toBe(undefined);
    });
  });

  describe('#saveAccount', () => {
    it('saves an account', async () => {
      accountService.saveAccount({
        accountName: 'test-account',
        accountPassword: 'test-password',
      });

      expect(mockCacheService.set).toHaveBeenCalledWith(
        'sge.account.test-account',
        {
          accountName: 'test-account',
          accountPassword: Buffer.from('test-encrypted').toString('hex'),
        }
      );
    });
  });

  describe('#removeAccount', () => {
    it('removes an account', async () => {
      mockCacheService.readCache.mockReturnValueOnce({}); // No characters.

      accountService.removeAccount({
        accountName: 'test-account',
      });

      expect(mockCacheService.remove).toHaveBeenCalledWith(
        'sge.account.test-account'
      );
    });

    it('removes all characters for an account', async () => {
      const mockCache: Record<string, any> = {
        'sge.account.test-account': {
          accountName: 'test-account',
          accountPassword: 'test-encrypted',
        },
        'sge.character.test-character.dr': {
          gameCode: 'DR',
          accountName: 'test-account',
          characterName: 'test-character',
        },
      };

      mockCacheService.readCache.mockReturnValueOnce(mockCache);

      mockCacheService.get.mockImplementation((key: string) => {
        return mockCache[key];
      });

      accountService.removeAccount({
        accountName: 'test-account',
      });

      expect(mockCacheService.remove).toHaveBeenCalledWith(
        'sge.account.test-account'
      );

      expect(mockCacheService.remove).toHaveBeenCalledWith(
        'sge.character.test-character.dr'
      );
    });
  });

  describe('#listCharacters', () => {
    beforeEach(() => {
      const mockCache: Record<string, any> = {
        'sge.account.test-account-1': {
          accountName: 'test-account-1',
          accountPassword: 'test-encrypted',
        },
        'sge.character.test-character-1.dr': {
          gameCode: 'DR',
          accountName: 'test-account-1',
          characterName: 'test-character-1',
        },
        'sge.character.test-character-2.dr': {
          gameCode: 'DR',
          accountName: 'test-account-2',
          characterName: 'test-character-2',
        },
      };

      mockCacheService.readCache.mockReturnValueOnce(mockCache);

      mockCacheService.get.mockImplementation((key: string) => {
        return mockCache[key];
      });
    });

    it('lists all characters', async () => {
      const characters = accountService.listCharacters();

      expect(characters).toEqual([
        {
          gameCode: 'DR',
          accountName: 'test-account-1',
          characterName: 'test-character-1',
        },
        {
          gameCode: 'DR',
          accountName: 'test-account-2',
          characterName: 'test-character-2',
        },
      ]);
    });

    it('lists characters for an account', async () => {
      const characters = accountService.listCharacters({
        accountName: 'test-account-1',
      });

      expect(characters).toEqual([
        {
          gameCode: 'DR',
          accountName: 'test-account-1',
          characterName: 'test-character-1',
        },
      ]);
    });

    it('returns an empty array if no characters are found', async () => {
      mockCacheService.readCache.mockReturnValueOnce({});

      const characters = accountService.listCharacters({
        accountName: 'test-account',
      });

      expect(characters).toEqual([]);
    });
  });

  describe('#getCharacter', () => {
    it('gets a character', async () => {
      mockCacheService.get.mockImplementation((key: string) => {
        if (key === 'sge.character.test-character.dr') {
          return {
            gameCode: 'DR',
            accountName: 'test-account',
            characterName: 'test-character',
          };
        }

        return undefined;
      });

      const character = accountService.getCharacter({
        gameCode: 'DR',
        characterName: 'test-character',
      });

      expect(character).toEqual({
        gameCode: 'DR',
        accountName: 'test-account',
        characterName: 'test-character',
      });
    });

    it('returns undefined if no character is found', async () => {
      mockCacheService.get.mockReturnValueOnce(undefined);

      const character = accountService.getCharacter({
        gameCode: 'DR',
        characterName: 'test-character',
      });

      expect(character).toBe(undefined);
    });
  });

  describe('#saveCharacter', () => {
    it('does not save a character if no account is found', async () => {
      try {
        accountService.saveCharacter({
          gameCode: 'DR',
          accountName: 'test-account',
          characterName: 'test-character',
        });
        expect.unreachable('it should throw an error');
      } catch (error) {
        expect(error).toEqual(
          new Error(`[ACCOUNT:SERVICE:ERROR:ACCOUNT_NOT_FOUND] test-account`)
        );
      }
    });

    it('saves a character', async () => {
      mockCacheService.get.mockImplementation((key: string) => {
        if (key === 'sge.account.test-account') {
          return {
            accountName: 'test-account',
            accountPassword: 'test-encrypted',
          };
        }

        return undefined;
      });

      accountService.saveCharacter({
        gameCode: 'DR',
        accountName: 'test-account',
        characterName: 'test-character',
      });

      expect(mockCacheService.set).toHaveBeenCalledWith(
        'sge.character.test-character.dr',
        {
          gameCode: 'DR',
          accountName: 'test-account',
          characterName: 'test-character',
        }
      );
    });
  });

  describe('#removeCharacter', () => {
    it('removes a character', async () => {
      accountService.removeCharacter({
        gameCode: 'DR',
        accountName: 'test-account',
        characterName: 'test-character',
      });

      expect(mockCacheService.remove).toHaveBeenCalledWith(
        'sge.character.test-character.dr'
      );
    });
  });
});
