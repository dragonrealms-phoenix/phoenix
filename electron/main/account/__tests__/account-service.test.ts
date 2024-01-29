import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Logger } from '../../../common/logger/types.js';
import { StoreServiceMock } from '../../store/__mocks__/store-service.mock.js';
import { AccountServiceImpl } from '../account.service.js';
import type { AccountService } from '../types.js';

type CreateLoggerModule = typeof import('../../logger/create-logger.js');

vi.mock('../../logger/create-logger.js', async (importOriginal) => {
  const originalModule = await importOriginal<CreateLoggerModule>();
  const logger: Logger = {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
  };
  return {
    ...originalModule,
    createLogger: vi.fn().mockReturnValue(logger),
  };
});

type ElectronModule = typeof import('electron');

vi.mock('electron', async (importOriginal) => {
  const actualModule = await importOriginal<ElectronModule>();
  return {
    ...actualModule,
    safeStorage: {
      encryptString: vi.fn().mockReturnValue(Buffer.from('test-encrypted')),
      decryptString: vi.fn().mockReturnValue('test-password'),
    },
  };
});

describe('account-service', () => {
  let storeService: StoreServiceMock;
  let accountService: AccountService;

  beforeEach(() => {
    storeService = new StoreServiceMock();
    accountService = new AccountServiceImpl({
      storeService,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe('#listAccounts', () => {
    it('should list accounts', async () => {
      storeService.keys.mockResolvedValueOnce([
        'sge.account.test-account-1',
        'sge.account.test-account-2',
      ]);

      storeService.get.mockImplementation((key) => {
        if (key === 'sge.account.test-account-1') {
          return {
            accountName: 'test-account-1',
            accountPassword: 'test-encrypted',
          };
        }

        if (key === 'sge.account.test-account-2') {
          return {
            accountName: 'test-account-2',
            accountPassword: 'test-encrypted',
          };
        }

        return undefined;
      });

      const accounts = await accountService.listAccounts();

      expect(accounts).toEqual([
        {
          accountName: 'test-account-1',
        },
        {
          accountName: 'test-account-2',
        },
      ]);
    });

    it('should return an empty array if no accounts are found', async () => {
      storeService.keys.mockResolvedValueOnce([]);

      const accounts = await accountService.listAccounts();

      expect(accounts).toEqual([]);
    });
  });

  describe('#getAccount', () => {
    it('should get an account', async () => {
      storeService.get.mockImplementation((key) => {
        if (key === 'sge.account.test-account') {
          return {
            accountName: 'test-account',
            accountPassword: 'test-encrypted',
          };
        }

        return undefined;
      });

      const account = await accountService.getAccount({
        accountName: 'test-account',
      });

      expect(account).toEqual({
        accountName: 'test-account',
        accountPassword: 'test-password',
      });
    });

    it('should return undefined if no account is found', async () => {
      storeService.get.mockResolvedValueOnce(undefined);

      const account = await accountService.getAccount({
        accountName: 'test-account',
      });

      expect(account).toBeUndefined();
    });
  });

  describe('#saveAccount', () => {
    it('should save an account', async () => {
      await accountService.saveAccount({
        accountName: 'test-account',
        accountPassword: 'test-password',
      });

      expect(storeService.set).toHaveBeenCalledWith(
        'sge.account.test-account',
        {
          accountName: 'test-account',
          accountPassword: Buffer.from('test-encrypted').toString('hex'),
        }
      );
    });
  });

  describe('#removeAccount', () => {
    it('should remove an account', async () => {
      storeService.keys.mockReturnValue([]); // No characters.

      await accountService.removeAccount({
        accountName: 'test-account',
      });

      expect(storeService.remove).toHaveBeenCalledWith(
        'sge.account.test-account'
      );
    });

    it('should remove all characters for an account', async () => {
      storeService.keys.mockReturnValueOnce([
        'sge.account.test-account',
        'sge.character.test-character.dr',
      ]);

      storeService.get.mockImplementation((key) => {
        if (key === 'sge.account.test-account') {
          return {
            accountName: 'test-account',
            accountPassword: 'test-encrypted',
          };
        }

        if (key === 'sge.character.test-character.dr') {
          return {
            gameCode: 'DR',
            accountName: 'test-account',
            characterName: 'test-character',
          };
        }

        return undefined;
      });

      await accountService.removeAccount({
        accountName: 'test-account',
      });

      expect(storeService.remove).toHaveBeenCalledWith(
        'sge.account.test-account'
      );

      expect(storeService.remove).toHaveBeenCalledWith(
        'sge.character.test-character.dr'
      );
    });
  });

  describe('#listCharacters', () => {
    it('should list all characters', async () => {
      storeService.keys.mockResolvedValueOnce([
        'sge.account.test-account-1',
        'sge.character.test-character-1.dr',
        'sge.character.test-character-2.dr',
      ]);

      storeService.get.mockImplementation((key) => {
        if (key === 'sge.account.test-account-1') {
          return {
            accountName: 'test-account-1',
            accountPassword: 'test-encrypted',
          };
        }

        if (key === 'sge.character.test-character-1.dr') {
          return {
            gameCode: 'DR',
            accountName: 'test-account-1',
            characterName: 'test-character-1',
          };
        }

        if (key === 'sge.character.test-character-2.dr') {
          return {
            gameCode: 'DR',
            accountName: 'test-account-2',
            characterName: 'test-character-2',
          };
        }

        return undefined;
      });

      const characters = await accountService.listCharacters();

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

    it('should list characters for an account', async () => {
      storeService.keys.mockResolvedValueOnce([
        'sge.account.test-account-1',
        'sge.character.test-character-1.dr',
        'sge.character.test-character-2.dr',
      ]);

      storeService.get.mockImplementation((key) => {
        if (key === 'sge.account.test-account-1') {
          return {
            accountName: 'test-account-1',
            accountPassword: 'test-encrypted',
          };
        }

        if (key === 'sge.character.test-character-1.dr') {
          return {
            gameCode: 'DR',
            accountName: 'test-account-1',
            characterName: 'test-character-1',
          };
        }

        if (key === 'sge.character.test-character-2.dr') {
          return {
            gameCode: 'DR',
            accountName: 'test-account-2',
            characterName: 'test-character-2',
          };
        }

        return undefined;
      });

      const characters = await accountService.listCharacters({
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

    it('should return an empty array if no characters are found', async () => {
      storeService.keys.mockResolvedValueOnce([]);

      const characters = await accountService.listCharacters({
        accountName: 'test-account',
      });

      expect(characters).toEqual([]);
    });
  });

  describe('#getCharacter', () => {
    it('should get a character', async () => {
      storeService.get.mockImplementation((key) => {
        if (key === 'sge.character.test-character.dr') {
          return {
            gameCode: 'DR',
            accountName: 'test-account',
            characterName: 'test-character',
          };
        }

        return undefined;
      });

      const character = await accountService.getCharacter({
        gameCode: 'DR',
        characterName: 'test-character',
      });

      expect(character).toEqual({
        gameCode: 'DR',
        accountName: 'test-account',
        characterName: 'test-character',
      });
    });

    it('should return undefined if no character is found', async () => {
      storeService.get.mockResolvedValueOnce(undefined);

      const character = await accountService.getCharacter({
        gameCode: 'DR',
        characterName: 'test-character',
      });

      expect(character).toBeUndefined();
    });
  });

  describe('#saveCharacter', () => {
    it('should not save a character if no account is found', async () => {
      try {
        await accountService.saveCharacter({
          gameCode: 'DR',
          accountName: 'test-account',
          characterName: 'test-character',
        });
        expect.unreachable('it should throw an error');
      } catch (error) {
        expect(error.message).toEqual(
          `[ACCOUNT:SERVICE:ERROR:ACCOUNT_NOT_FOUND] test-account`
        );
      }
    });

    it('should save a character', async () => {
      storeService.get.mockImplementation((key) => {
        if (key === 'sge.account.test-account') {
          return {
            accountName: 'test-account',
            accountPassword: 'test-encrypted',
          };
        }

        return undefined;
      });

      await accountService.saveCharacter({
        gameCode: 'DR',
        accountName: 'test-account',
        characterName: 'test-character',
      });

      expect(storeService.set).toHaveBeenCalledWith(
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
    it('should remove a character', async () => {
      await accountService.removeCharacter({
        gameCode: 'DR',
        accountName: 'test-account',
        characterName: 'test-character',
      });

      expect(storeService.remove).toHaveBeenCalledWith(
        'sge.character.test-character.dr'
      );
    });
  });
});
