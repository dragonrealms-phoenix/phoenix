import { ipcMain } from 'electron';
import { createLogger } from '../logger';
import type { Dispatcher } from '../types';
import type {
  IpcHandlerRegistry,
  IpcInvokableEvent,
  IpcInvokeHandler,
} from './ipc.types';

const logger = createLogger('ipc');

export class IpcController {
  private dispatch: Dispatcher;
  private ipcHandlerRegistry: IpcHandlerRegistry;

  constructor(options: { dispatch: Dispatcher }) {
    this.dispatch = options.dispatch;
    this.ipcHandlerRegistry = this.createIpcHandlerRegistry();
  }

  private createIpcHandlerRegistry(): IpcHandlerRegistry {
    return {
      ping: this.pingHandler,
      sgeAddAccount: this.sgeAddAccountHandler,
      sgeRemoveAccount: this.sgeRemoveAccountHandler,
      sgeListAccounts: this.sgeListAccountsHandler,
      sgeListCharacters: this.sgeListCharactersHandler,
      gamePlayCharacter: this.gamePlayCharacterHandler,
      gameSendCommand: this.gameSendCommandHandler,
    };
  }

  public registerHandlers(): void {
    Object.keys(this.ipcHandlerRegistry).forEach((channel) => {
      const handler = this.ipcHandlerRegistry[channel as IpcInvokableEvent];

      if (!handler) {
        logger.error('no handler registered for channel', { channel });
        throw new Error(`[IPC:CHANNEL:INVALID] ${channel}`);
      }

      ipcMain.handle(channel, async (_event, ...params) => {
        try {
          logger.debug('handling channel request', { channel });
          const result = await handler(params as any);
          logger.debug('handled channel request', { channel });
          return result;
        } catch (error) {
          logger.error('error handling channel request', { channel, error });
          throw new Error(`[IPC:CHANNEL:ERROR] ${channel}: ${error?.message}`);
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

  private sgeAddAccountHandler: IpcInvokeHandler<'sgeAddAccount'> = async (
    args
  ): Promise<void> => {
    const { gameCode, username, password } = args[0];

    // TODO
    logger.info('sgeAddAccountHandler', { gameCode, username });
  };

  private sgeRemoveAccountHandler: IpcInvokeHandler<'sgeRemoveAccount'> =
    async (args): Promise<void> => {
      const { gameCode, username } = args[0];

      // TODO
      logger.info('sgeRemoveAccountHandler', { gameCode, username });
    };

  private sgeListAccountsHandler: IpcInvokeHandler<'sgeListAccounts'> = async (
    args
  ): Promise<
    Array<{
      gameCode: string;
      username: string;
    }>
  > => {
    const { gameCode } = args[0];

    // TODO
    logger.info('sgeListAccountsHandler', { gameCode });

    return [];
  };

  private sgeListCharactersHandler: IpcInvokeHandler<'sgeListCharacters'> =
    async (
      args
    ): Promise<
      Array<{
        id: string;
        name: string;
      }>
    > => {
      const { gameCode, username } = args[0];

      // TODO
      logger.info('sgeListCharactersHandler', { gameCode, username });

      return [];
    };

  private gamePlayCharacterHandler: IpcInvokeHandler<'gamePlayCharacter'> =
    async (args): Promise<void> => {
      const { gameCode, username, characterName } = args[0];

      logger.info('gamePlayCharacterHandler', {
        gameCode,
        username,
        characterName,
      });

      // TODO look up sge credentials for { gameCode, username }
      // TODO use sge service to get character game play credentials
      // TODO Game.initInstance({ credentials, dispatch });
      // TODO game instance emit data via dispatch function
      // TODO renderer listens for game data and updates ui accordingly
    };

  private gameSendCommandHandler: IpcInvokeHandler<'gameSendCommand'> = async (
    args
  ): Promise<void> => {
    const command = args[0];

    logger.info('gameSendCommandHandler', { command });

    // TODO Game.getInstance().sendCommand(command);
  };
}
