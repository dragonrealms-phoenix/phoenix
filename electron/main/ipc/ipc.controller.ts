import { ipcMain } from 'electron';
import { Game } from '../game';
import { createLogger } from '../logger';
import type { SGEGameCode } from '../sge';
import { SGEServiceImpl } from '../sge';
import { store } from '../store';
import type { Dispatcher } from '../types';
import type {
  IpcHandlerRegistry,
  IpcInvokableEvent,
  IpcInvokeHandler,
  SGEListAccountsResponse,
  SGEListCharactersResponse,
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

    logger.debug('sgeAddAccountHandler', { gameCode, username });

    const key = this.getSgeAccountStoreKey({ gameCode, username });
    await store.set(key, password, { encrypted: true });
  };

  private sgeRemoveAccountHandler: IpcInvokeHandler<'sgeRemoveAccount'> =
    async (args): Promise<void> => {
      const { gameCode, username } = args[0];

      logger.debug('sgeRemoveAccountHandler', { gameCode, username });

      const key = this.getSgeAccountStoreKey({ gameCode, username });
      await store.remove(key);
    };

  private sgeListAccountsHandler: IpcInvokeHandler<'sgeListAccounts'> = async (
    args
  ): Promise<SGEListAccountsResponse> => {
    const { gameCode } = args[0];

    logger.debug('sgeListAccountsHandler', { gameCode });

    const keys = await store.keys();
    const keyPrefix = this.getSgeAccountStoreKey({ gameCode, username: '' });

    const accounts = keys
      .filter((key) => {
        return key.startsWith(keyPrefix);
      })
      .map((key) => {
        const username = key.slice(keyPrefix.length);
        return { gameCode, username };
      });

    return accounts;
  };

  private sgeListCharactersHandler: IpcInvokeHandler<'sgeListCharacters'> =
    async (args): Promise<SGEListCharactersResponse> => {
      const { gameCode, username } = args[0];

      logger.debug('sgeListCharactersHandler', { gameCode, username });

      const key = this.getSgeAccountStoreKey({ gameCode, username });
      const password = await store.get<string>(key);

      if (password) {
        const sgeService = new SGEServiceImpl({
          gameCode: gameCode as SGEGameCode,
          username,
          password,
        });
        return sgeService.listCharacters();
      }

      throw new Error(`[IPC:SGE:ACCOUNT:NOT_FOUND] ${gameCode}:${username}`);
    };

  private gamePlayCharacterHandler: IpcInvokeHandler<'gamePlayCharacter'> =
    async (args): Promise<void> => {
      const { gameCode, username, characterName } = args[0];

      logger.debug('gamePlayCharacterHandler', {
        gameCode,
        username,
        characterName,
      });

      const key = this.getSgeAccountStoreKey({ gameCode, username });
      const password = await store.get<string>(key);

      if (!password) {
        throw new Error(`[IPC:SGE:ACCOUNT:NOT_FOUND] ${gameCode}:${username}`);
      }

      const sgeService = new SGEServiceImpl({
        gameCode: gameCode as SGEGameCode,
        username,
        password,
      });

      const credentials = await sgeService.loginCharacter(characterName);

      const gameInstance = Game.initInstance({
        credentials,
        dispatch: this.dispatch,
      });

      await gameInstance.connect();
    };

  private gameSendCommandHandler: IpcInvokeHandler<'gameSendCommand'> = async (
    args
  ): Promise<void> => {
    const command = args[0];

    logger.debug('gameSendCommandHandler', { command });

    const gameInstance = Game.getInstance();

    if (gameInstance) {
      gameInstance.send(command);
    } else {
      throw new Error('[IPC:GAME:INSTANCE:NOT_FOUND]');
    }
  };

  private getSgeAccountStoreKey(options: {
    gameCode: string;
    username: string;
  }): string {
    const { gameCode, username } = options;
    return `sge.account.${gameCode}.${username}`.toLowerCase();
  }
}
