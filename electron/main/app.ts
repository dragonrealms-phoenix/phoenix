import {
  BrowserWindow,
  Event,
  WebContentsWillNavigateEventParams,
  app,
  ipcMain,
  shell,
} from 'electron';
import path from 'node:path';
import serve from 'electron-serve';
import { createLogger } from './logger';
import { initializeMenu } from './menu';

app.setName('Phoenix');
app.setAppUserModelId('com.github.dragonrealms-phoenix.phoenix');

const logger = createLogger('main');

const appPath = app.getAppPath();
const appBuildPath = path.join(appPath, 'electron', 'build');
const appPreloadPath = path.join(appBuildPath, 'preload');
const appRendererPath = path.join(appBuildPath, 'renderer');

// Register custom protocol 'app://' to serve our app.
// Registering the protocol must be done before the app is ready.
// This is necessary for both security and for single-page apps.
// https://bishopfox.com/blog/reasonably-secure-electron
// https://github.com/sindresorhus/electron-serve
serve({ directory: appRendererPath });

const createWindow = async (): Promise<void> => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(appPreloadPath, 'index.js'),
      /**
       * Security Best Practices
       * https://www.electronjs.org/docs/latest/tutorial/security
       * https://github.com/moloch--/reasonably-secure-electron
       */
      allowRunningInsecureContent: false,
      contextIsolation: true,
      experimentalFeatures: false,
      navigateOnDragDrop: false,
      nodeIntegration: false,
      nodeIntegrationInSubFrames: false,
      nodeIntegrationInWorker: false,
      safeDialogs: true,
      sandbox: true,
      webSecurity: true,
      webviewTag: false,
    },
  });

  await mainWindow.loadURL('app://-');

  initializeMenu(mainWindow);
};

// Prepare the renderer once the app is ready
app.on('ready', async () => {
  createWindow();

  // Listen for events emitted by the preload api
  ipcMain.handle('ping', async (): Promise<string> => {
    // Return response to renderer
    return 'pong';
  });
});

app.on('activate', (): void => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Disable or limit creation of new windows to protect app and users.
// https://www.electronjs.org/docs/latest/tutorial/security
app.on('web-contents-created', (_, contents) => {
  const allowedDomains = [
    /^(www.)?github\.com$/i,
    /^(www.)?play\.net$/i,
    /^elanthipedia\.play\.net$/i,
  ];

  const isAllowedDomain = (domain: string): boolean => {
    return allowedDomains.some((d) => d.test(domain));
  };

  const blockOrOpenURL = (
    event: Event<WebContentsWillNavigateEventParams>,
    url: string
  ): void => {
    const domain = new URL(url).hostname;
    // If the domain is allowed, open it in the user's default browser.
    if (isAllowedDomain(domain)) {
      logger.info('opening url in default browser', { url });
      setImmediate(() => {
        shell.openExternal(url);
      });
    } else {
      logger.warn('blocked window navigation', { url });
    }
    event.preventDefault();
  };

  contents.on('will-navigate', (event, url) => {
    logger.info('will-navigate', { url });
    blockOrOpenURL(event, url);
  });

  contents.on('will-redirect', (event, url) => {
    logger.info('will-redirect', { url });
    blockOrOpenURL(event, url);
  });
});

app.on('window-all-closed', (): void => {
  // Quit when all windows are closed, except on macOS.
  // It's convention for macOS apps to stay open until the user quits them.
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('quit', (): void => {
  logger.info('until next time, brave adventurer');
});
