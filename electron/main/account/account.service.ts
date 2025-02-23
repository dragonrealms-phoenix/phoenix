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
import type { CacheService } from '../cache/types.js';
import { logger } from './logger.js';
import type { AccountService } from './types.js';

export class AccountServiceImpl implements AccountService {
  private cacheService: CacheService;

  constructor(options: { cacheService: CacheService }) {
    this.cacheService = options.cacheService;
  }

  public listAccounts(): Array<Account> {
    logger.debug('listing accounts');

    const accounts = new Array<Account>();

    const accountKeys = this.listAccountStoreKeys();

    accountKeys.forEach((accountKey) => {
      const account = this.cacheService.get<AccountWithPassword>(accountKey);
      if (account) {
        accounts.push(omit(account, 'accountPassword'));
      }
    });

    logger.debug('accounts found', {
      count: accounts.length,
    });

    return accounts;
  }

  public getAccount(options: {
    accountName: string;
  }): Maybe<AccountWithPassword> {
    const { accountName } = options;

    logger.debug('getting account', {
      accountName,
    });

    const key = this.getAccountStoreKey({ accountName });
    const account = this.cacheService.get<AccountWithPassword>(key);

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

  public saveAccount(account: AccountWithPassword): void {
    const { accountName, accountPassword } = account;

    logger.debug('saving account', {
      accountName,
    });

    const encryptedAccount: AccountWithPassword = {
      accountName,
      accountPassword: this.encryptString(accountPassword),
    };

    const accountKey = this.getAccountStoreKey({ accountName });
    this.cacheService.set(accountKey, encryptedAccount);

    logger.debug('saved account', {
      accountName,
    });
  }

  public removeAccount(options: { accountName: string }): void {
    const { accountName } = options;

    logger.debug('removing account', { accountName });

    const accountKey = this.getAccountStoreKey({ accountName });
    this.cacheService.remove(accountKey);

    logger.debug('removed account', { accountName });

    this.removeCharactersByAccount({ accountName });
  }

  public listCharacters(options?: { accountName?: string }): Array<Character> {
    const { accountName } = options ?? {};

    logger.debug('listing characters', {
      accountName,
    });

    const characters = new Array<Character>();

    const characterKeys = this.listCharacterStoreKeys();

    characterKeys.forEach((characterKey) => {
      const character = this.cacheService.get<Character>(characterKey);
      if (character) {
        if (
          isEmpty(accountName) ||
          equalsIgnoreCase(character.accountName, accountName)
        ) {
          characters.push(character);
        }
      }
    });

    logger.debug('characters found', {
      count: characters.length,
    });

    return characters;
  }

  public getCharacter(options: {
    characterName: string;
    gameCode: string;
  }): Maybe<Character> {
    const { characterName, gameCode } = options;

    logger.debug('getting character', {
      characterName,
      gameCode,
    });

    const characterKey = this.getCharacterStoreKey({ characterName, gameCode });
    const character = this.cacheService.get<Character>(characterKey);

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

  public saveCharacter(character: Character): void {
    const { accountName, characterName, gameCode } = character;

    logger.debug('saving character', {
      accountName,
      characterName,
      gameCode,
    });

    // Confirm the account exists, otherwise we have
    // no credentials by which to play the character.
    const account = this.getAccount({ accountName });
    if (!account) {
      throw new Error(
        `[ACCOUNT:SERVICE:ERROR:ACCOUNT_NOT_FOUND] ${accountName}`
      );
    }

    const characterKey = this.getCharacterStoreKey({
      characterName,
      gameCode,
    });

    this.cacheService.set(characterKey, character);

    logger.debug('saved character', {
      accountName,
      characterName,
      gameCode,
    });
  }

  public removeCharacter(character: Character): void {
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

    this.cacheService.remove(characterKey);

    logger.debug('removed character', {
      accountName,
      characterName,
      gameCode,
    });
  }

  private removeCharactersByAccount(options: { accountName: string }): void {
    const { accountName } = options;

    logger.debug('removing characters for account', {
      accountName,
    });

    const characters = this.listCharacters({ accountName });

    characters.forEach((character) => {
      this.removeCharacter(character);
    });

    logger.debug('removed characters for account', {
      accountName,
    });
  }

  private listAccountStoreKeys(): Array<string> {
    const allKeys = this.listAllKeys();

    const accountKeys = allKeys.filter((key) => {
      return this.isAccountStoreKey(key);
    });

    return accountKeys;
  }

  private listCharacterStoreKeys(): Array<string> {
    const allKeys = this.listAllKeys();

    const characterKeys = allKeys.filter((key) => {
      return this.isCharacterStoreKey(key);
    });

    return characterKeys;
  }

  private listAllKeys(): Array<string> {
    return Object.keys(this.cacheService.readCache());
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
