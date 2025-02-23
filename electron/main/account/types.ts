import type {
  Account,
  AccountWithPassword,
  Character,
} from '../../common/account/types.js';
import type { Maybe } from '../../common/types.js';

/**
 * A data-store abstraction over managing local accounts and characters.
 * Does not interact with the play.net service.
 */
export interface AccountService {
  /**
   * Lists all accounts.
   * For security and performance, won't include passwords.
   */
  listAccounts(): Array<Account>;

  /**
   * Gets an account by name.
   * The password will be decrypted.
   */
  getAccount(options: { accountName: string }): Maybe<AccountWithPassword>;

  /**
   * Adds or updates an account.
   * The password will be encrypted.
   */
  saveAccount(account: AccountWithPassword): void;

  /**
   * Removes an account and all of its characters.
   */
  removeAccount(options: { accountName: string }): void;

  /**
   * Lists all characters, optionally filtered by an account.
   */
  listCharacters(options?: { accountName?: string }): Array<Character>;

  /**
   * Gets a character by name.
   */
  getCharacter(options: {
    characterName: string;
    gameCode: string;
  }): Maybe<Character>;

  /**
   * Adds or updates a character to an account.
   */
  saveCharacter(character: Character): void;

  /**
   * Removes a character from an account.
   */
  removeCharacter(character: Character): void;
}
