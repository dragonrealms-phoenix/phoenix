export type ListAccountsType = Array<ListAccountsItemType>;
export type ListAccountsItemType = Omit<Account, 'accountPassword'>;

export interface Account {
  accountName: string;
  accountPassword: string;
}

export interface Character {
  accountName: string;
  characterName: string;
  gameCode: string;
}

/**
 * A data-store abstraction over managing local accounts and characters.
 * Does not interact with the play.net service.
 */
export interface AccountService {
  /**
   * Lists all accounts.
   */
  listAccounts(): Promise<ListAccountsType>;

  /**
   * Gets an account by name.
   * The password will be decrypted.
   */
  getAccount(options: { accountName: string }): Promise<Account | undefined>;

  /**
   * Adds or updates an account.
   * The password will be encrypted.
   */
  saveAccount(account: Account): Promise<void>;

  /**
   * Removes an account and all of its characters.
   */
  removeAccount(options: { accountName: string }): Promise<void>;

  /**
   * Lists all characters.
   */
  listCharacters(): Promise<Array<Character>>;

  /**
   * Lists all characters for an account.
   */
  listCharacters(options?: { accountName?: string }): Promise<Array<Character>>;

  /**
   * Gets a character by name.
   */
  getCharacter(options: {
    characterName: string;
    gameCode: string;
  }): Promise<Character | undefined>;

  /**
   * Adds or updates a character to an account.
   */
  saveCharacter(character: Character): Promise<void>;

  /**
   * Removes a character from an account.
   */
  removeCharacter(character: Character): Promise<void>;
}
