import { ipcMain } from 'electron';
import { toUpperSnakeCase } from '../../common/string/to-upper-snake-case.js';
import { AccountServiceImpl } from '../account/account.service.js';
import type { AccountService } from '../account/types.js';
import { Game } from '../game/game.instance.js';
import { Store } from '../store/store.instance.js';
import { listCharactersHandler } from './handlers/list-characters.js';
import { pingHandler } from './handlers/ping.js';
import { playCharacterHandler } from './handlers/play-character.js';
import { removeAccountHandler } from './handlers/remove-account.js';
import { removeCharacterHandler } from './handlers/remove-character.js';
import { saveAccountHandler } from './handlers/save-account.js';
import { saveCharacterHandler } from './handlers/save-character.js';
import { sendCommandHandler } from './handlers/send-command.js';
import { logger } from './logger.js';
import type {
  IpcDispatcher,
  IpcHandlerRegistry,
  IpcInvokableEvent,
} from './types.js';

/**
 * I didn't like the app nor controller needing to know about
 * the account service implementation so I created this util
 * to abstract that concern. For testing, or if we ever need to
 * specify the account service implementation, we can still
 * use this method or use the IpController constructor directly.
 */
export const newIpcController = (options: {
  dispatch: IpcDispatcher;
  accountService?: AccountService;
}): IpcController => {
  const {
    dispatch,
    accountService = new AccountServiceImpl({
      storeService: Store,
    }),
  } = options;

  return new IpcController({
    dispatch,
    accountService,
  });
};

export class IpcController {
  private dispatch: IpcDispatcher;
  private accountService: AccountService;
  private ipcHandlerRegistry: IpcHandlerRegistry;

  constructor(options: {
    dispatch: IpcDispatcher;
    accountService: AccountService;
  }) {
    this.dispatch = options.dispatch;
    this.accountService = options.accountService;
    this.ipcHandlerRegistry = this.createIpcHandlerRegistry();
    this.registerHandlers(this.ipcHandlerRegistry);
  }

  /**
   * Unregisters all ipc handlers and disconnects from the game server.
   */
  public async destroy(): Promise<void> {
    Object.keys(this.ipcHandlerRegistry).forEach((channel) => {
      ipcMain.removeHandler(channel);
    });
    await Game.getInstance()?.disconnect();
  }

  private createIpcHandlerRegistry(): IpcHandlerRegistry {
    return {
      ping: pingHandler({
        dispatch: this.dispatch,
      }),

      saveAccount: saveAccountHandler({
        accountService: this.accountService,
      }),

      removeAccount: removeAccountHandler({
        accountService: this.accountService,
      }),

      saveCharacter: saveCharacterHandler({
        accountService: this.accountService,
      }),

      removeCharacter: removeCharacterHandler({
        accountService: this.accountService,
      }),

      listCharacters: listCharactersHandler({
        accountService: this.accountService,
      }),

      playCharacter: playCharacterHandler({
        dispatch: this.dispatch,
        accountService: this.accountService,
      }),

      sendCommand: sendCommandHandler({
        dispatch: this.dispatch,
      }),
    };
  }

  private registerHandlers(registry: IpcHandlerRegistry): void {
    Object.keys(registry).forEach((channel) => {
      const handler = registry[channel as IpcInvokableEvent];

      if (!handler) {
        logger.error('no handler registered for channel', { channel });
        throw new Error(`[IPC:CHANNEL:ERROR:HANDLER_NOT_FOUND] ${channel}`);
      }

      ipcMain.handle(channel, async (_event, ...params) => {
        try {
          logger.debug('handling channel request', { channel });
          const result = await handler(params as any);
          logger.debug('handled channel request', { channel });
          return result;
        } catch (error) {
          logger.error('error handling channel request', { channel, error });
          throw new Error(
            `[IPC:CHANNEL:ERROR:${toUpperSnakeCase(channel)}] ${error.message}`
          );
        }
      });
    });
  }
}
