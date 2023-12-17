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
  IpcSgeCharacter,
} from './ipc.types';

const logger = createLogger('ipc');

const SGE_CHARACTER_STORE_KEY_PREFIX = 'sge.character.';

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
      sgeAddCharacter: this.sgeAddCharacterHandler,
      sgeRemoveCharacter: this.sgeRemoveCharacterHandler,
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

  private sgeAddCharacterHandler: IpcInvokeHandler<'sgeAddCharacter'> = async (
    args
  ): Promise<void> => {
    const { gameCode, accountName, accountPassword, characterName } = args[0];

    logger.debug('sgeAddCharacterHandler', {
      gameCode,
      accountName,
      characterName,
    });

    const key = this.formatSgeCharacterStoreKey({
      gameCode,
      accountName,
      characterName,
    });

    await store.set(key, accountPassword, { encrypted: true });
  };

  private sgeRemoveCharacterHandler: IpcInvokeHandler<'sgeRemoveCharacter'> =
    async (args): Promise<void> => {
      const { gameCode, accountName, characterName } = args[0];

      logger.debug('sgeRemoveCharacterHandler', {
        gameCode,
        accountName,
        characterName,
      });

      const key = this.formatSgeCharacterStoreKey({
        gameCode,
        accountName,
        characterName,
      });

      await store.remove(key);
    };

  private sgeListCharactersHandler: IpcInvokeHandler<'sgeListCharacters'> =
    async (): Promise<Array<IpcSgeCharacter>> => {
      logger.debug('sgeListCharactersHandler');

      const keys = await store.keys();

      const characters = keys
        .filter((key) => {
          return this.isSgeCharacterStoreKey(key);
        })
        .map((key) => {
          return this.parseSgeCharacterStoreKey(key);
        });

      return characters;
    };

  private gamePlayCharacterHandler: IpcInvokeHandler<'gamePlayCharacter'> =
    async (args): Promise<void> => {
      const { gameCode, accountName, characterName } = args[0];

      logger.debug('gamePlayCharacterHandler', {
        gameCode,
        accountName,
        characterName,
      });

      const key = this.formatSgeCharacterStoreKey({
        gameCode,
        accountName,
        characterName,
      });

      const accountPassword = await store.get<string>(key);

      if (!accountPassword) {
        throw new Error(
          `[IPC:SGE:PASSWORD:NOT_FOUND] ${gameCode}:${accountName}:${characterName}`
        );
      }

      const sgeService = new SGEServiceImpl({
        gameCode: gameCode as SGEGameCode,
        username: accountName,
        password: accountPassword,
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

  private formatSgeCharacterStoreKey(options: {
    gameCode: string;
    accountName: string;
    characterName: string;
  }): string {
    const { gameCode, accountName, characterName } = options;

    return [
      SGE_CHARACTER_STORE_KEY_PREFIX,
      gameCode,
      accountName,
      characterName,
    ]
      .join('.')
      .toLowerCase();
  }

  private parseSgeCharacterStoreKey(key: string): IpcSgeCharacter {
    const character: IpcSgeCharacter = {
      gameCode: '',
      accountName: '',
      characterName: '',
    };

    if (this.isSgeCharacterStoreKey(key)) {
      const [_x, _y, gameCode, accountName, characterName] = key.split('.');
      return {
        gameCode,
        accountName,
        characterName,
      };
    }

    return character;
  }

  private isSgeCharacterStoreKey(key: string): boolean {
    return key.startsWith(SGE_CHARACTER_STORE_KEY_PREFIX);
  }
}
