import { ipcMain } from 'electron';
import type { AppAPI } from '../../preload';
import { createLogger } from '../logger';
import type { SGEGameCode } from '../sge';
import { SGEServiceImpl } from '../sge';
import type { IpcHandlerRegistry, IpcInvokeHandler } from './ipc.types';

const logger = createLogger('ipc');

const pingHandler: IpcInvokeHandler<'ping'> = async (): Promise<string> => {
  return 'pong';
};

const sgeListCharactersHandler: IpcInvokeHandler<'sgeListCharacters'> = async (
  args
) => {
  const { username, password, gameCode } = args[0];

  logger.debug('sgeListCharacters', { username, gameCode });

  const sgeService = new SGEServiceImpl({
    username,
    password,
    gameCode: gameCode as SGEGameCode,
  });

  const characters = await sgeService.listCharacters();

  logger.debug('sgeListCharacters', { characters });

  return characters;
};

const sgePlayCharacterHandler: IpcInvokeHandler<'sgePlayCharacter'> = async (
  args
) => {
  const { username, password, gameCode, characterName } = args[0];

  logger.debug('sgePlayCharacter', { username, gameCode, characterName });

  const sgeService = new SGEServiceImpl({
    username,
    password,
    gameCode: gameCode as SGEGameCode,
  });

  const credentials = await sgeService.loginCharacter(characterName);

  logger.debug('sgePlayCharacter', { credentials });
};

const ipcHandlerRegistry: IpcHandlerRegistry = {
  ping: pingHandler,
  sgeListCharacters: sgeListCharactersHandler,
  sgePlayCharacter: sgePlayCharacterHandler,
};

export const registerIpcHandlers = (): void => {
  Object.keys(ipcHandlerRegistry).forEach((channel) => {
    const handler = ipcHandlerRegistry[channel as keyof AppAPI];

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
};
