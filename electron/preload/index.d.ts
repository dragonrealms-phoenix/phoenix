/**
 * The index.d.ts file is auto-generated by the build process.
 */
declare const appAPI: {
  ping: () => Promise<string>;
  /**
   * Add or update credentials for a play.net account.
   */
  saveAccount: (options: {
    accountName: string;
    accountPassword: string;
  }) => Promise<void>;
  /**
   * Remove credentials for a play.net account.
   */
  removeAccount: (options: { accountName: string }) => Promise<void>;
  /**
   * Add or update a character for a given play.net account and game instance.
   */
  saveCharacter: (options: {
    accountName: string;
    characterName: string;
    gameCode: string;
  }) => Promise<void>;
  /**
   * Remove a character for a given play.net account and game instance.
   */
  removeCharacter: (options: {
    accountName: string;
    characterName: string;
    gameCode: string;
  }) => Promise<void>;
  /**
   * List added characters.
   */
  listCharacters: () => Promise<
    {
      accountName: string;
      characterName: string;
      gameCode: string;
    }[]
  >;
  /**
   * Play the game with a given character.
   * This app can only play one character at a time.
   * Use the `onMessage` API to receive game data.
   * Use the `sendCommand` API to send game commands.
   */
  playCharacter: (options: {
    accountName: string;
    characterName: string;
    gameCode: string;
  }) => Promise<void>;
  /**
   * Sends a command to the game as the currently playing character.
   * Use the `onMessage` API to receive game data.
   */
  sendCommand: (command: string) => Promise<void>;
  /**
   * Allows the renderer to subscribe to messages from the main process.
   */
  onMessage: (
    channel: string,
    callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void
  ) => void;
  /**
   * Allows the renderer to unsubscribe from messages from the main process.
   * Removes all listeners added by the `onMessage` API for a channel.
   *
   * For example, when subscribing to messages in a react app, the
   * `useEffect` hook will subscribe multiple times, once per time the hook
   * is regenerated. To prevent this, ensure to unsubscribe in the hook's
   * destroy function. https://stackoverflow.com/a/73458622/470818
   */
  removeAllListeners(channel: string): void;
};
declare global {
  type TypeOfAppAPI = typeof appAPI;
  type AppAPI = {
    [K in keyof TypeOfAppAPI]: TypeOfAppAPI[K];
  };
  interface Window {
    api: AppAPI;
  }
}
export type { AppAPI };
