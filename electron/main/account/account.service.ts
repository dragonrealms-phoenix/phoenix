import { safeStorage } from 'electron';
import isEmpty from 'lodash-es/isEmpty.js';
import omit from 'lodash-es/omit.js';
import type {
  Account,
  AccountWithPassword,
  Character,
} from '../../common/account/types.js';
import { equalsIgnoreCase } from '../../common/string/string.utils.js';
import type { Maybe } from '../../common/types.js';
import type { StoreService } from '../store/types.js';
import { logger } from './logger.js';
import type { AccountService } from './types.js';

export class AccountServiceImpl implements AccountService {
  private storeService: StoreService;

  constructor(options: { storeService: StoreService }) {
    this.storeService = options.storeService;
  }

  public async listAccounts(): Promise<Array<Account>> {
    logger.debug('listing accounts');

    const accounts = new Array<Account>();

    const accountKeys = await this.listAccountStoreKeys();

    await Promise.all(
      accountKeys.map(async (key) => {
        const account = await this.storeService.get<AccountWithPassword>(key);
        if (account) {
          accounts.push(omit(account, 'accountPassword'));
        }
      })
    );

    logger.debug('accounts found', {
      count: accounts.length,
    });

    return accounts;
  }

  public async getAccount(options: {
    accountName: string;
  }): Promise<Maybe<AccountWithPassword>> {
    const { accountName } = options;

    logger.debug('getting account', {
      accountName,
    });

    const key = this.getAccountStoreKey({ accountName });
    const account = await this.storeService.get<AccountWithPassword>(key);

    if (!account) {
      logger.debug('no account found', {
        accountName,
      });
      return;
    }

    logger.debug('account found', {
      accountName,
    });

    const { accountPassword } = account;

    const decryptedAccount: AccountWithPassword = {
      ...account,
      accountPassword: this.decryptString(accountPassword),
    };

    return decryptedAccount;
  }

  public async saveAccount(account: AccountWithPassword): Promise<void> {
    const { accountName, accountPassword } = account;

    logger.debug('saving account', {
      accountName,
    });

    const encryptedAccount: AccountWithPassword = {
      accountName,
      accountPassword: this.encryptString(accountPassword),
    };

    const accountKey = this.getAccountStoreKey({ accountName });
    await this.storeService.set(accountKey, encryptedAccount);

    logger.debug('saved account', {
      accountName,
    });
  }

  public async removeAccount(options: { accountName: string }): Promise<void> {
    const { accountName } = options;

    logger.debug('removing account', { accountName });

    const accountKey = this.getAccountStoreKey({ accountName });
    await this.storeService.remove(accountKey);

    logger.debug('removed account', { accountName });

    await this.removeCharactersByAccount({ accountName });
  }

  public async listCharacters(options?: {
    accountName?: string;
  }): Promise<Array<Character>> {
    const { accountName } = options ?? {};

    logger.debug('listing characters', {
      accountName,
    });

    const characters = new Array<Character>();

    const characterKeys = await this.listCharacterStoreKeys();

    await Promise.all(
      characterKeys.map(async (characterKey) => {
        const character = await this.storeService.get<Character>(characterKey);
        if (character) {
          if (
            isEmpty(accountName) ||
            equalsIgnoreCase(character.accountName, accountName)
          ) {
            characters.push(character);
          }
        }
      })
    );

    logger.debug('characters found', {
      count: characters.length,
    });

    return characters;
  }

  public async getCharacter(options: {
    characterName: string;
    gameCode: string;
  }): Promise<Maybe<Character>> {
    const { characterName, gameCode } = options;

    logger.debug('getting character', {
      characterName,
      gameCode,
    });

    const characterKey = this.getCharacterStoreKey({ characterName, gameCode });
    const character = await this.storeService.get<Character>(characterKey);

    if (!character) {
      logger.debug('no character found', {
        characterName,
        gameCode,
      });
      return;
    }

    logger.debug('character found', {
      characterName,
      gameCode,
    });

    return character;
  }

  public async saveCharacter(character: Character): Promise<void> {
    const { accountName, characterName, gameCode } = character;

    logger.debug('saving character', {
      accountName,
      characterName,
      gameCode,
    });

    // Confirm the account exists, otherwise we have
    // no credentials by which to play the character.
    const account = await this.getAccount({ accountName });
    if (!account) {
      throw new Error(
        `[ACCOUNT:SERVICE:ERROR:ACCOUNT_NOT_FOUND] ${accountName}`
      );
    }

    const characterKey = this.getCharacterStoreKey({
      characterName,
      gameCode,
    });

    await this.storeService.set(characterKey, character);

    logger.debug('saved character', {
      accountName,
      characterName,
      gameCode,
    });
  }

  public async removeCharacter(character: Character): Promise<void> {
    const { accountName, characterName, gameCode } = character;

    logger.debug('removing character', {
      accountName,
      characterName,
      gameCode,
    });

    const characterKey = this.getCharacterStoreKey({
      characterName,
      gameCode,
    });

    await this.storeService.remove(characterKey);

    logger.debug('removed character', {
      accountName,
      characterName,
      gameCode,
    });
  }

  private async removeCharactersByAccount(options: {
    accountName: string;
  }): Promise<void> {
    const { accountName } = options;

    logger.debug('removing characters for account', {
      accountName,
    });

    const characters = await this.listCharacters({ accountName });

    await Promise.all(
      characters.map(async (character) => {
        await this.removeCharacter(character);
      })
    );

    logger.debug('removed characters for account', {
      accountName,
    });
  }

  private async listAccountStoreKeys(): Promise<Array<string>> {
    const allKeys = await this.storeService.keys();

    const accountKeys = allKeys.filter((key) => {
      return this.isAccountStoreKey(key);
    });

    return accountKeys;
  }

  private async listCharacterStoreKeys(): Promise<Array<string>> {
    const allKeys = await this.storeService.keys();

    const characterKeys = allKeys.filter((key) => {
      return this.isCharacterStoreKey(key);
    });

    return characterKeys;
  }

  private isAccountStoreKey(key: string): boolean {
    return key.startsWith('sge.account.');
  }

  private isCharacterStoreKey(key: string): boolean {
    return key.startsWith('sge.character.');
  }

  private getAccountStoreKey(options: { accountName: string }): string {
    const { accountName } = options;
    return `sge.account.${accountName}`.toLowerCase();
  }

  private getCharacterStoreKey(options: {
    characterName: string;
    gameCode: string;
  }): string {
    const { characterName, gameCode } = options;
    return `sge.character.${characterName}.${gameCode}`.toLowerCase();
  }

  private encryptString(value: string): string {
    return safeStorage.encryptString(value).toString('hex');
  }

  private decryptString(value: string): string {
    return safeStorage.decryptString(Buffer.from(value, 'hex'));
  }
}
