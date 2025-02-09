import { ipcMain } from 'electron';
import { toUpperSnakeCase } from '../../common/string/string.utils.js';
import type { AccountService } from '../account/types.js';
import { Game } from '../game/game.instance.js';
import { listAccountsHandler } from './handlers/list-accounts.js';
import { listCharactersHandler } from './handlers/list-characters.js';
import { logHandler } from './handlers/log.js';
import { pingHandler } from './handlers/ping.js';
import { playCharacterHandler } from './handlers/play-character.js';
import { quitCharacterHandler } from './handlers/quit-character.js';
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

export class IpcController {
  private dispatch: IpcDispatcher;
  private accountService: AccountService;
  private handlerRegistry: IpcHandlerRegistry;

  constructor(options: {
    dispatch: IpcDispatcher;
    accountService: AccountService;
  }) {
    this.dispatch = options.dispatch;
    this.accountService = options.accountService;
    this.handlerRegistry = this.createHandlerRegistry();
    this.registerHandlers(this.handlerRegistry);
  }

  /**
   * Unregisters all handlers and disconnects from the game server.
   */
  public async destroy(): Promise<void> {
    this.unregisterHandlers(this.handlerRegistry);
    await this.disconnectFromGame();
  }

  /**
   * Creates map of channels to their handler functions.
   */
  private createHandlerRegistry(): IpcHandlerRegistry {
    return {
      ping: pingHandler({
        dispatch: this.dispatch,
      }),

      log: logHandler({
        logger,
      }),

      saveAccount: saveAccountHandler({
        accountService: this.accountService,
      }),

      removeAccount: removeAccountHandler({
        accountService: this.accountService,
      }),

      listAccounts: listAccountsHandler({
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

      quitCharacter: quitCharacterHandler({
        dispatch: this.dispatch,
      }),

      sendCommand: sendCommandHandler({
        dispatch: this.dispatch,
      }),
    };
  }

  /**
   * For each channel in the handler registry, register the handler
   * with electron's IPC module to actually receive and process messages.
   */
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

  private unregisterHandlers(registry: IpcHandlerRegistry): void {
    Object.keys(registry).forEach((channel) => {
      ipcMain.removeHandler(channel);
    });
  }

  private async disconnectFromGame(): Promise<void> {
    await Game.getInstance()?.disconnect();
  }
}
