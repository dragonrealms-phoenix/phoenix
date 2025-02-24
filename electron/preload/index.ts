import type { IpcRendererEvent } from 'electron';
import { contextBridge, ipcRenderer } from 'electron';
import type {
  Account,
  AccountWithPassword,
  Character,
} from '../common/account/types.js';
import type { Layout } from '../common/layout/types.js';
import type { LogMessage } from '../common/logger/types.js';
import type { Maybe } from '../common/types.js';

/**
 * The index.d.ts file is auto-generated by the build process.
 */

type IpcRendererEventCallback = (
  event: IpcRendererEvent,
  ...args: Array<any>
) => void;

// Custom APIs for renderer.
// Proxies request to the main process then returns any response.
const appAPI = {
  ping: async (): Promise<string> => {
    return ipcRenderer.invoke('ping');
  },
  /**
   * Logs a message to the main process.
   */
  log: async (message: LogMessage): Promise<void> => {
    return ipcRenderer.invoke('log', message);
  },
  /**
   * Add or update credentials for a play.net account.
   */
  saveAccount: async (account: AccountWithPassword): Promise<void> => {
    return ipcRenderer.invoke('saveAccount', account);
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
  listAccounts: async (): Promise<Array<Account>> => {
    return ipcRenderer.invoke('listAccounts');
  },
  /**
   * Add or update a character for a given play.net account and game instance.
   */
  saveCharacter: async (character: Character): Promise<void> => {
    return ipcRenderer.invoke('saveCharacter', character);
  },
  /**
   * Remove a character for a given play.net account and game instance.
   */
  removeCharacter: async (character: Character): Promise<void> => {
    return ipcRenderer.invoke('removeCharacter', character);
  },
  /**
   * List added characters.
   */
  listCharacters: async (): Promise<Array<Character>> => {
    return ipcRenderer.invoke('listCharacters');
  },
  /**
   * Play the game with a given character.
   * This app can only play one character at a time.
   * Use the `onMessage` API to receive game data.
   * Use the `sendCommand` API to send game commands.
   */
  playCharacter: async (character: Character): Promise<void> => {
    return ipcRenderer.invoke('playCharacter', character);
  },
  /**
   * Quit the game with the currently playing character, if any.
   * Similar to sending the `quit` command to the game but awaits
   * the game to confirm the quit before resolving.
   */
  quitCharacter: async (): Promise<void> => {
    return ipcRenderer.invoke('quitCharacter');
  },
  /**
   * Gets a layout by name.
   */
  getLayout: async (options: {
    layoutName: string;
  }): Promise<Maybe<Layout>> => {
    return ipcRenderer.invoke('getLayout', options);
  },
  /**
   * Lists all layout names.
   */
  listLayoutNames: async (): Promise<Array<string>> => {
    return ipcRenderer.invoke('listLayoutNames');
  },
  /**
   * Saves a layout by name.
   */
  saveLayout: async (options: {
    layoutName: string;
    layout: Layout;
  }): Promise<void> => {
    return ipcRenderer.invoke('saveLayout', options);
  },
  /**
   * Deletes a layout by name.
   */
  deleteLayout: async (options: { layoutName: string }): Promise<void> => {
    return ipcRenderer.invoke('deleteLayout', options);
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
    callback: (...args: Array<any>) => void
  ): OnMessageUnsubscribe => {
    // Per electron security best practices, don't expose the event object.
    // https://www.electronjs.org/docs/latest/tutorial/security#20-do-not-expose-electron-apis-to-untrusted-web-content
    const listener: IpcRendererEventCallback = (_event, ...args) => {
      callback(...args);
    };

    ipcRenderer.on(channel, listener);

    return () => {
      ipcRenderer.off(channel, listener);
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
