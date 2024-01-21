import type { Event } from 'electron';
import { BrowserWindow, app, shell } from 'electron';
import * as path from 'node:path';
import serve from 'electron-serve';
import { runInBackground } from '../common/async';
import type { IpcController } from './ipc';
import { newIpcController } from './ipc';
import { createLogger } from './logger';
import { initializeMenu } from './menu';
import { PreferenceKey, Preferences } from './preference';
import type { Dispatcher } from './types';

app.setName('Phoenix');
app.setAppUserModelId('com.github.dragonrealms-phoenix.phoenix');

const logger = createLogger('app');

const appEnv = process.env.APP_ENV ?? 'production';
const appEnvIsProd = appEnv === 'production';
const appEnvIsDev = appEnv === 'development';

// Only load dev tools when running in development.
const appEnableDevTools = appEnvIsDev && !app.isPackaged;

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

let ipcController: IpcController;

const createMainWindow = async (): Promise<void> => {
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
    minWidth: 600,
    minHeight: 500,
    show: false, // hidden until window loads contents to avoid a blank screen
    webPreferences: {
      preload: path.join(appPreloadPath, 'index.js'),
      devTools: appEnableDevTools,
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

  const zoomFactor = await Preferences.get(PreferenceKey.WINDOW_ZOOM_FACTOR);
  mainWindow.webContents.setZoomFactor(zoomFactor ?? 1);

  // Once the window has finished loading, show it.
  mainWindow.webContents.once('did-finish-load', () => {
    logger.debug('showing main window');
    mainWindow.show();
  });

  const dispatch: Dispatcher = (channel, ...args): void => {
    // When the window is closed or destroyed, we might still
    // receive async events from the ipc controller. Ignore them.
    // This usually happens when the app is quit while a game is being played.
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send(channel, ...args);
    }
  };

  ipcController = newIpcController({ dispatch });

  logger.debug('loading main window', { appUrl });
  await mainWindow.loadURL(appUrl);

  initializeMenu(mainWindow);
};

// Prepare the renderer once the app is ready
app.on('ready', () => {
  runInBackground(async () => {
    if (appEnableDevTools) {
      const { installChromeExtensions } = await import(
        './chrome/install-extension'
      );
      await installChromeExtensions();
    }
    await createMainWindow();
  });
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

  contents.setWindowOpenHandler(({ url }) => {
    const domain = new URL(url).hostname;
    // If the domain is allowed, open it in the user's default browser.
    if (isAllowedDomain(domain)) {
      runInBackground(async () => {
        logger.debug('opening url in default browser', { url });
        await shell.openExternal(url);
      });
    } else {
      logger.warn('blocked window navigation', { url });
    }
    // Prevent window navigation within the app.
    return { action: 'deny' };
  });

  contents.on('will-navigate', (event, url) => {
    logger.debug('will-navigate', { url });
  });

  contents.on('will-redirect', (event, url) => {
    logger.debug('will-redirect', { url });
  });
});

app.on('window-all-closed', (): void => {
  logger.debug('windows all closed, quitting app');
  app.quit();
});

/**
 * Trick to await async operations before quitting.
 * https://github.com/electron/electron/issues/9433#issuecomment-960635576
 */
enum BeforeQuitActionStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

let beforeQuitActionStatus = BeforeQuitActionStatus.NOT_STARTED;

app.on('before-quit', (event: Event): void => {
  switch (beforeQuitActionStatus) {
    case BeforeQuitActionStatus.NOT_STARTED:
      // don't quit yet, start our async before-quit operations instead
      event.preventDefault();
      beforeQuitActionStatus = BeforeQuitActionStatus.IN_PROGRESS;
      runInBackground(async () => {
        logger.debug('performing before-quit operations');
        await ipcController?.destroy();
        beforeQuitActionStatus = BeforeQuitActionStatus.COMPLETED;
        app.quit();
      });
      break;
    case BeforeQuitActionStatus.IN_PROGRESS:
      // don't quit yet, we are still awaiting our before-quit operations
      event.preventDefault();
      break;
    case BeforeQuitActionStatus.COMPLETED:
      // no further action needed, continue to quit the app like normal
      break;
  }
});

app.on('quit', (): void => {
  logger.debug('quitting app');
  logger.info('until next time, brave adventurer');
});
