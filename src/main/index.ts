import { BrowserWindow, app, ipcMain, shell } from 'electron';
import { join } from 'path';
import { is, optimizer, platform } from '@electron-toolkit/utils';
import { createLogger } from './logger';
import { initializeMenu } from './menu';
import { initializeSentry } from './sentry';

initializeSentry();

const logger = createLogger('main');

app.setName('Phoenix');
app.setAppUserModelId('com.github.dragonrealms-phoenix.phoenix');
app.setAboutPanelOptions({
  applicationName: app.name,
  applicationVersion: app.getVersion(),
  version: `${app.getVersion()}-${import.meta.env.MAIN_VITE_GIT_SHORT_HASH}`,
  authors: ['Katoak'],
  website: 'https://github.com/dragonrealms-phoenix/phoenix',
});

function createWindow(): void {
  logger.info('creating main window');

  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.on('ready-to-show', (): void => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  initializeMenu(mainWindow);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then((): void => {
  createWindow();

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window): void => {
    optimizer.watchWindowShortcuts(window);
  });

  app.on('activate', (): void => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Listen for events emitted by the preload api
  ipcMain.handle('ping', async (): Promise<string> => {
    // Return response to renderer
    return 'pong';
  });
});

// Quit when all windows are closed, except on macOS.
// It's convention for macOS apps to stay open until the user quits them.
app.on('window-all-closed', (): void => {
  if (platform.isMacOS === false) {
    app.quit();
  }
});
