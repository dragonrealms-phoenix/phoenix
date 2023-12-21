import { safeStorage } from 'electron';
import { isEmpty, omit } from 'lodash';
import { equalsIgnoreCase } from '../../common/string';
import type { Maybe } from '../../common/types';
import { createLogger } from '../logger';
import type { StoreService } from '../store';
import type {
  Account,
  AccountService,
  Character,
  ListAccountsType,
} from './account.types';

const logger = createLogger('account:service');

export class AccountServiceImpl implements AccountService {
  private store: StoreService;

  constructor(options: { store: StoreService }) {
    this.store = options.store;
  }

  public async listAccounts(): Promise<ListAccountsType> {
    logger.info('listing accounts');

    const allKeys = await this.store.keys();

    const accountKeys = allKeys.filter((key) => {
      return this.isAccountStoreKey(key);
    });

    const accounts: ListAccountsType = [];

    await Promise.all(
      accountKeys.map(async (accountKey) => {
        const account = await this.store.get<Account>(accountKey);
        if (account) {
          accounts.push(omit(account, 'accountPassword'));
        }
      })
    );

    return accounts;
  }

  public async getAccount(options: {
    accountName: string;
  }): Promise<Maybe<Account>> {
    const { accountName } = options;

    logger.info('getting account', { accountName });

    const accountKey = this.getAccountStoreKey({ accountName });
    const account = await this.store.get<Account>(accountKey);

    if (!account) {
      logger.debug('no account found', { accountName });
      return undefined;
    }

    logger.debug('account found', { accountName });

    const { accountPassword } = account;

    const decryptedAccount: Account = {
      ...account,
      accountPassword: this.decryptString(accountPassword),
    };

    return decryptedAccount;
  }

  public async saveAccount(account: Account): Promise<void> {
    const { accountName, accountPassword } = account;

    logger.info('saving account', { accountName });

    const encryptedAccount: Account = {
      accountName,
      accountPassword: this.encryptString(accountPassword),
    };

    const accountKey = this.getAccountStoreKey({ accountName });
    await this.store.set(accountKey, encryptedAccount);
  }

  public async removeAccount(options: { accountName: string }): Promise<void> {
    const { accountName } = options;

    logger.info('removing account', { accountName });

    const accountKey = this.getAccountStoreKey({ accountName });
    await this.store.remove(accountKey);

    const characters = await this.listCharacters({ accountName });
    await Promise.all(
      characters.map(async (character) => {
        await this.removeCharacter(character);
      })
    );
  }

  public async listCharacters(options?: {
    accountName?: string;
  }): Promise<Array<Character>> {
    const { accountName } = options ?? {};

    logger.info('listing characters', { accountName });

    const allKeys = await this.store.keys();

    const characterKeys = allKeys.filter((key) => {
      return this.isCharacterStoreKey(key);
    });

    const characters = new Array<Character>();

    await Promise.all(
      characterKeys.map(async (characterKey) => {
        const character = await this.store.get<Character>(characterKey);
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

    return characters;
  }

  public async getCharacter(options: {
    characterName: string;
    gameCode: string;
  }): Promise<Maybe<Character>> {
    const { characterName, gameCode } = options;

    logger.info('getting character', { characterName, gameCode });

    const characterKey = this.getCharacterStoreKey({ characterName, gameCode });
    const character = await this.store.get<Character>(characterKey);

    if (!character) {
      logger.debug('no character found', {
        characterName,
        gameCode,
      });
      return undefined;
    }

    logger.debug('character found', { characterName, gameCode });
    return character;
  }

  public async saveCharacter(character: Character): Promise<void> {
    const { accountName, characterName, gameCode } = character;

    logger.info('saving character', { accountName, characterName, gameCode });

    const characterKey = this.getCharacterStoreKey({
      characterName,
      gameCode,
    });

    await this.store.set(characterKey, character);
  }

  public async removeCharacter(character: Character): Promise<void> {
    const { accountName, characterName, gameCode } = character;

    logger.info('removing character', { accountName, characterName, gameCode });

    const characterKey = this.getCharacterStoreKey({
      characterName,
      gameCode,
    });

    await this.store.remove(characterKey);
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
