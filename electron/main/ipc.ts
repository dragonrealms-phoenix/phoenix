import { ipcMain } from 'electron';
import type { AppAPI } from '../preload';
import { createLogger } from './logger';

const logger = createLogger('ipc');

interface IpcInvokeHandler<K extends keyof AppAPI> {
  (params: Parameters<AppAPI[K]>): ReturnType<AppAPI[K]>;
}

type IpcHandlerRegistry = {
  [channel in keyof AppAPI]: IpcInvokeHandler<channel>;
};

const pingIpcInvokeHandler: IpcInvokeHandler<
  'ping'
> = async (): Promise<string> => {
  return 'pong';
};

const speakIpcInvokeHandler: IpcInvokeHandler<'speak'> = async (
  params
): Promise<void> => {
  const [text] = params;
  `Hello, ${text}`;
};

const climbIpcInvokeHandler: IpcInvokeHandler<'climb'> = async (
  params
): Promise<number> => {
  const [data] = params;
  return data.height * 2;
};

const ipcHandlerRegistry: IpcHandlerRegistry = {
  ping: pingIpcInvokeHandler,
  speak: speakIpcInvokeHandler,
  climb: climbIpcInvokeHandler,
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
        logger.debug('handling channel request', { channel, params });
        const result = await handler(params as any);
        logger.debug('handled channel request', { channel, result });
        return result;
      } catch (error) {
        logger.error('error handling channel request', { channel, error });
        throw new Error(`[IPC:CHANNEL:ERROR] ${channel}: ${error?.message}`);
      }
    });
  });
};
