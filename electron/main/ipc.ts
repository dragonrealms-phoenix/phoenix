import { ipcMain } from 'electron';
import { createLogger } from './logger';

const logger = createLogger('ipc');

export const registerIpcHandlers = (): void => {
  // TODO rather than register unique ipcMain.handle('word') handlers,
  //      use a design pattern where we have one ipcMain handler that
  //      receives a standard payload.
  //      In here, we then route the payload to the appropriate handler.
  //      I saw this pattern on the webs somewhere.
  registerPingHandler();
};

const registerPingHandler = (): void => {
  ipcMain.handle('ping', async (): Promise<string> => {
    logger.info('ping');
    return 'pong';
  });
};
