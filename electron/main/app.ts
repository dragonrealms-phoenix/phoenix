import type { Event, WebContentsWillNavigateEventParams } from 'electron';
import { BrowserWindow, app, shell } from 'electron';
import path from 'node:path';
import serve from 'electron-serve';
import { runInBackground } from '../common/async';
import { AccountServiceImpl } from './account';
import { Game } from './game';
import { IpcController } from './ipc';
import { createLogger } from './logger';
import { initializeMenu } from './menu';
import { Store } from './store';
import type { Dispatcher } from './types';

app.setName('Phoenix');
app.setAppUserModelId('com.github.dragonrealms-phoenix.phoenix');

const logger = createLogger('app');

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

const createWindow = async (): Promise<void> => {
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
    logger.info('showing window');
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

  const ipcController = new IpcController({
    dispatch,
    accountService: new AccountServiceImpl({
      storeService: Store.getInstance(),
    }),
  });

  ipcController.registerHandlers();

  await mainWindow.loadURL(appUrl);

  initializeMenu(mainWindow);
};

// Prepare the renderer once the app is ready
app.on('ready', () => {
  runInBackground(async () => {
    await createWindow();
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

  const blockOrOpenURL = (
    event: Event<WebContentsWillNavigateEventParams>,
    url: string
  ): void => {
    const domain = new URL(url).hostname;
    // If the domain is allowed, open it in the user's default browser.
    if (isAllowedDomain(domain)) {
      runInBackground(async () => {
        logger.info('opening url in default browser', { url });
        await shell.openExternal(url);
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
        await Game.getInstance()?.disconnect();
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
  logger.info('until next time, brave adventurer');
});
