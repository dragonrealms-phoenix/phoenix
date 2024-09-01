import type { IpcRendererEvent } from 'electron';
import { contextBridge, ipcRenderer } from 'electron';

/**
 * The index.d.ts file is auto-generated by the build process.
 */

// Custom APIs for renderer.
// Proxies request to the main process then returns any response.
const appAPI = {
  ping: async (): Promise<string> => {
    return ipcRenderer.invoke('ping');
  },
  /**
   * Add or update credentials for a play.net account.
   */
  saveAccount: async (options: {
    accountName: string;
    accountPassword: string;
  }): Promise<void> => {
    return ipcRenderer.invoke('saveAccount', options);
  },
  /**
   * Remove credentials for a play.net account.
   */
  removeAccount: async (options: { accountName: string }): Promise<void> => {
    return ipcRenderer.invoke('removeAccount', options);
  },
  /**
   * List added accounts.
   */
  listAccounts: async (): Promise<
    Array<{
      accountName: string;
    }>
  > => {
    return ipcRenderer.invoke('listAccounts');
  },
  /**
   * Add or update a character for a given play.net account and game instance.
   */
  saveCharacter: async (options: {
    accountName: string;
    characterName: string;
    gameCode: string;
  }): Promise<void> => {
    return ipcRenderer.invoke('saveCharacter', options);
  },
  /**
   * Remove a character for a given play.net account and game instance.
   */
  removeCharacter: async (options: {
    accountName: string;
    characterName: string;
    gameCode: string;
  }): Promise<void> => {
    return ipcRenderer.invoke('removeCharacter', options);
  },
  /**
   * List added characters.
   */
  listCharacters: async (): Promise<
    Array<{
      accountName: string;
      characterName: string;
      gameCode: string;
    }>
  > => {
    return ipcRenderer.invoke('listCharacters');
  },
  /**
   * Play the game with a given character.
   * This app can only play one character at a time.
   * Use the `onMessage` API to receive game data.
   * Use the `sendCommand` API to send game commands.
   */
  playCharacter: async (options: {
    accountName: string;
    characterName: string;
    gameCode: string;
  }): Promise<void> => {
    return ipcRenderer.invoke('playCharacter', options);
  },
  /**
   * Sends a command to the game as the currently playing character.
   * Use the `onMessage` API to receive game data.
   */
  sendCommand: async (command: string): Promise<void> => {
    return ipcRenderer.invoke('sendCommand', command);
  },
  /**
   * Allows the renderer to subscribe to messages from the main process.
   * Returns an unsubscribe function, useful in react hook cleanup functions.
   */
  onMessage: (
    channel: string,
    callback: (event: IpcRendererEvent, ...args: Array<any>) => void
  ): OnMessageUnsubscribe => {
    ipcRenderer.on(channel, callback);

    return () => {
      ipcRenderer.off(channel, callback);
    };
  },
  /**
   * Allows the renderer to unsubscribe from messages from the main process.
   * Removes all listeners added by the `onMessage` API for a channel.
   */
  removeAllListeners(channel: string): void {
    ipcRenderer.removeAllListeners(channel);
  },
};

declare global {
  type OnMessageUnsubscribe = () => void;

  type TypeOfAppAPI = typeof appAPI;

  type AppAPI = {
    [K in keyof TypeOfAppAPI]: TypeOfAppAPI[K];
  };

  interface Window {
    api: AppAPI;
  }
}

contextBridge.exposeInMainWorld('api', appAPI);

export type { AppAPI };
