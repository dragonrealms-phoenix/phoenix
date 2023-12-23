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

const logger = createLogger('ipc');

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

  public registerHandlers(): void {
    Object.keys(this.ipcHandlerRegistry).forEach((channel) => {
      const handler = this.ipcHandlerRegistry[channel as IpcInvokableEvent];

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
            `[IPC:CHANNEL:ERROR:${toUpperSnakeCase(channel)}] ${error?.message}`
          );
        }
      });
    });
  }

  public deregisterHandlers(): void {
    Object.keys(this.ipcHandlerRegistry).forEach((channel) => {
      ipcMain.removeHandler(channel);
      ipcMain.removeAllListeners(channel);
    });
  }

  private pingHandler: IpcInvokeHandler<'ping'> = async (): Promise<string> => {
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

    const gameInstance = Game.newInstance({
      credentials,
      dispatch: this.dispatch,
    });

    await gameInstance.connect();
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
