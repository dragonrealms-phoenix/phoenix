import { ipcMain } from 'electron';
import { toUpperSnakeCase } from '../../common/string';
import type { AccountService } from '../account';
import { Game } from '../game';
import { createLogger } from '../logger';
import type { SGEGameCode } from '../sge';
import { SGEServiceImpl } from '../sge';
import type { Dispatcher } from '../types';
import type {
  IpcHandlerRegistry,
  IpcInvokableEvent,
  IpcInvokeHandler,
  IpcSgeCharacter,
} from './ipc.types';

const logger = createLogger('ipc:controller');

export class IpcController {
  private dispatch: Dispatcher;
  private accountService: AccountService;
  private ipcHandlerRegistry: IpcHandlerRegistry;

  constructor(options: {
    dispatch: Dispatcher;
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
      ping: this.pingHandler,
      saveAccount: this.saveAccountHandler,
      removeAccount: this.removeAccountHandler,
      saveCharacter: this.saveCharacterHandler,
      removeCharacter: this.removeCharacterHandler,
      listCharacters: this.listCharactersHandler,
      playCharacter: this.playCharacterHandler,
      sendCommand: this.sendCommandHandler,
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

  private pingHandler: IpcInvokeHandler<'ping'> = async (): Promise<string> => {
    this.dispatch('pong', 'pong');
    return 'pong';
  };

  private saveAccountHandler: IpcInvokeHandler<'saveAccount'> = async (
    args
  ): Promise<void> => {
    const { accountName, accountPassword } = args[0];

    logger.debug('saveAccountHandler', { accountName });

    await this.accountService.saveAccount({
      accountName,
      accountPassword,
    });
  };

  private removeAccountHandler: IpcInvokeHandler<'removeAccount'> = async (
    args
  ): Promise<void> => {
    const { accountName } = args[0];

    logger.debug('removeAccountHandler', { accountName });

    await this.accountService.removeAccount({ accountName });
  };

  private saveCharacterHandler: IpcInvokeHandler<'saveCharacter'> = async (
    args
  ): Promise<void> => {
    const { gameCode, accountName, characterName } = args[0];

    logger.debug('saveCharacterHandler', {
      accountName,
      characterName,
      gameCode,
    });

    await this.accountService.saveCharacter({
      accountName,
      characterName,
      gameCode,
    });
  };

  private removeCharacterHandler: IpcInvokeHandler<'removeCharacter'> = async (
    args
  ): Promise<void> => {
    const { gameCode, accountName, characterName } = args[0];

    logger.debug('removeCharacterHandler', {
      accountName,
      characterName,
      gameCode,
    });

    await this.accountService.removeCharacter({
      accountName,
      characterName,
      gameCode,
    });
  };

  private listCharactersHandler: IpcInvokeHandler<'listCharacters'> =
    async (): Promise<Array<IpcSgeCharacter>> => {
      logger.debug('listCharactersHandler');

      return this.accountService.listCharacters();
    };

  private playCharacterHandler: IpcInvokeHandler<'playCharacter'> = async (
    args
  ): Promise<void> => {
    const { accountName, characterName, gameCode } = args[0];

    logger.debug('playCharacterHandler', {
      accountName,
      characterName,
      gameCode,
    });

    const account = await this.accountService.getAccount({
      accountName,
    });

    if (!account) {
      throw new Error(
        `[IPC:PLAY_CHARACTER:ERROR:ACCOUNT_NOT_FOUND] ${accountName}`
      );
    }

    const sgeService = new SGEServiceImpl({
      gameCode: gameCode as SGEGameCode,
      username: account.accountName,
      password: account.accountPassword,
    });

    const credentials = await sgeService.loginCharacter(characterName);

    const gameInstance = await Game.newInstance({
      credentials,
    });

    const gameEvents$ = await gameInstance.connect();

    this.dispatch('game:connect', {
      accountName,
      characterName,
      gameCode,
    });

    logger.debug('subscribing to game service stream');
    gameEvents$.subscribe({
      next: (gameEvent) => {
        logger.debug('game service stream event', { gameEvent });
        this.dispatch('game:event', gameEvent);
      },
      error: (error) => {
        logger.error('game service stream error', { error });
        this.dispatch('game:error', error);
      },
      complete: () => {
        logger.debug('game service stream completed');
        this.dispatch('game:disconnect', {
          accountName,
          characterName,
          gameCode,
        });
      },
    });
  };

  private sendCommandHandler: IpcInvokeHandler<'sendCommand'> = async (
    args
  ): Promise<void> => {
    const command = args[0];

    logger.debug('sendCommandHandler', { command });

    const gameInstance = Game.getInstance();

    if (gameInstance) {
      gameInstance.send(command);
    } else {
      throw new Error('[IPC:SEND_COMMAND:ERROR:GAME_INSTANCE_NOT_FOUND]');
    }
  };
}
