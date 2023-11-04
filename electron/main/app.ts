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

const appEnv = process.env.APP_ENV ?? 'production';
const appEnvIsProd = appEnv === 'production';
const appEnvIsDev = appEnv === 'development';

const appPath = app.getAppPath();
const appElectronPath = path.join(appPath, 'electron');
const appBuildPath = path.join(appElectronPath, 'build');
const appPreloadPath = path.join(appBuildPath, 'preload');

// When running in production, serve the app from these paths.
const prodRendererPath = path.join(appBuildPath, 'renderer');
const prodAppScheme = 'app';
const prodAppUrl = `${prodAppScheme}://-`;

// When running in development, serve the app from these paths.
const devRendererPath = path.join(appElectronPath, 'renderer');
const devPort = 3000;
const devAppUrl = `http://localhost:${devPort}`;

const appUrl = appEnvIsProd ? prodAppUrl : devAppUrl;

// Register custom protocol 'app://' to serve our app.
// Registering the protocol must be done before the app is ready.
// This is necessary for both security and for single-page apps.
// https://bishopfox.com/blog/reasonably-secure-electron
// https://github.com/sindresorhus/electron-serve
if (appEnvIsProd) {
  serve({
    scheme: prodAppScheme,
    directory: prodRendererPath,
  });
}

// Multiple events on startup might try to create a window.
// For example, just starting the app or clicking the dock icon.
// Track if we are already creating one to avoid conflicts.
let isCreatingWindow = false;

const createWindow = async (): Promise<void> => {
  if (isCreatingWindow) {
    return;
  }

  isCreatingWindow = true;

  if (appEnvIsDev) {
    // If running in development, serve the renderer from localhost.
    // This must be done once the app is ready.
    // This enables hot reloading of the renderer.
    const { default: serveDev } = await import('electron-next');
    await serveDev(devRendererPath, devPort);
  }

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false, // hidden until window loads contents to avoid a blank screen
    webPreferences: {
      preload: path.join(appPreloadPath, 'index.js'),
      devTools: !app.isPackaged,
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

  // Once the window has finished loading, show it.
  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.show();
  });

  await mainWindow.loadURL(appUrl);

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
    /^(www\.)?github\.com$/i,
    /^(www\.)?play\.net$/i,
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
