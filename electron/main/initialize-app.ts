import type { Event } from 'electron';
import { BrowserWindow, app, dialog, shell } from 'electron';
import path from 'node:path';
import fs from 'fs-extra';
import trimEnd from 'lodash-es/trimEnd.js';
import { VERSION } from '../common/version.js';
import { Accounts } from './account/account.instance.js';
import { runInBackground } from './async/run-in-background.js';
import { IpcController } from './ipc/ipc.controller.js';
import type { IpcDispatcher } from './ipc/types.js';
import { Layouts } from './layout/layout.instance.js';
import { getScopedLogger } from './logger/logger.factory.js';
import { getLogLevel } from './logger/logger.utils.js';
import { initializeMenu } from './menu/menu.js';
import { Preferences } from './preference/preference.instance.js';
import { PreferenceKey } from './preference/types.js';

export const initializeApp = async (): Promise<void> => {
  const logger = getScopedLogger('main:app');
  logger.info('welcome, brave adventurer!');
  logger.info('one moment while we prepare for your journey...');

  const appEnv = process.env.APP_ENV ?? 'production';
  const appEnvIsProd = appEnv === 'production';
  const appEnvIsDev = appEnv === 'development';

  logger.debug('app env', {
    appEnv,
    version: VERSION,
    logLevel: getLogLevel(),
  });

  // Only load dev tools when running in development.
  const appEnableDevTools = appEnvIsDev && !app.isPackaged;

  // When we migrated to ESM, the app path changed.
  // Instead of being at the root of the project, it's the directory
  // where this code file was invoked at runtime.
  // As a workaround, we trim off the extra path segments.
  const appPath = trimEnd(
    app.getAppPath(),
    path.join('electron', 'build', 'main')
  );
  const appElectronPath = path.join(appPath, 'electron');
  const appBuildPath = path.join(appElectronPath, 'build');
  const appPreloadPath = path.join(appBuildPath, 'preload');

  // Web pages' cookies and caches are stored in the `sessionData` directory.
  // Chromium writes lots of files here, so to not pollute the user's app data
  // we put all of this in a separate directory.
  const appSessionDataPath = path.join(app.getPath('userData'), 'chromium');
  fs.ensureDirSync(appSessionDataPath);
  app.setPath('sessionData', appSessionDataPath);

  // When running in production, serve the app from these paths.
  const prodRendererPath = path.join(appBuildPath, 'renderer');
  const prodAppScheme = 'app';
  const prodAppHost = '-'; // arbitrary, mimicking electron-serve module
  const prodAppUrl = `${prodAppScheme}://${prodAppHost}`;

  // When running in development, serve the app from these paths.
  const devRendererPath = path.join(appElectronPath, 'renderer');
  const devPort = 3000; // arbitrary
  const devAppUrl = `http://localhost:${devPort}`;

  const appUrl = appEnvIsProd ? prodAppUrl : devAppUrl;

  logger.debug('app paths', {
    appPath,
    appElectronPath,
    appBuildPath,
    appPreloadPath,
    prodRendererPath,
    devRendererPath,
    appDataPath: app.getPath('appData'),
    userDataPath: app.getPath('userData'),
    sessionDataPath: app.getPath('sessionData'),
    tempPath: app.getPath('temp'),
    logsPath: app.getPath('logs'),
  });

  // Register custom protocol 'app://' to serve our app.
  // Registering the protocol must be done before the app is ready.
  // This is necessary for both security and for single-page apps.
  // https://bishopfox.com/blog/reasonably-secure-electron
  if (appEnvIsProd) {
    const { serve } = await import('./electron-next/serve.prod.js');
    serve({
      scheme: prodAppScheme,
      dirPath: prodRendererPath,
    });
  }

  let ipcController: IpcController;

  const createMainWindow = async (): Promise<void> => {
    logger.debug('creating main window');

    if (appEnvIsDev) {
      // If running in development, serve the renderer from localhost.
      // This must be done once the app is ready.
      // This enables hot reloading of the renderer.
      const { serve } = await import('./electron-next/serve.dev.js');
      await serve({
        port: devPort,
        dirPath: devRendererPath,
      });
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

    // Once the window has finished loading, show it.
    mainWindow.webContents.once('did-finish-load', () => {
      logger.debug('showing main window');
      mainWindow.show();
    });

    const dispatch: IpcDispatcher = (channel, ...args): void => {
      // When the window is closed or destroyed, we might still
      // receive async events from the ipc controller. Ignore them.
      // This usually happens when the app is quit while a game is being played.
      if (!mainWindow.isDestroyed()) {
        mainWindow.webContents.send(channel, ...args);
      }
    };

    ipcController = new IpcController({
      dispatch,
      accountService: Accounts,
      layoutService: Layouts,
    });

    logger.debug('loading main window', { appUrl });
    await mainWindow.loadURL(appUrl);

    initializeMenu(mainWindow);
  };

  // Prepare the renderer once the app is ready
  app.on('ready', () => {
    logger.info('electron is ready');
    runInBackground(async () => {
      if (appEnableDevTools) {
        logger.debug('installing chrome extension dev tools');
        const { installChromeExtensions } = await import(
          './chrome/install-extension.js'
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
      // https://regex101.com/r/pUmfMR/1
      /^(.*\.)?github\.com$/i,
      /^(.*\.)?play\.net$/i,
    ];

    const isAllowedDomain = (domain: string): boolean => {
      return allowedDomains.some((d) => d.test(domain));
    };

    contents.setWindowOpenHandler(({ url }) => {
      const domain = new URL(url).hostname;

      // If the domain is allowed, open it in the user's default browser.
      // Otherwise route it through the play.net bounce page for safety.
      if (!isAllowedDomain(domain)) {
        logger.warn('navigation request to unexpected url', { url });
        url = `https://www.play.net/bounce/redirect.asp?URL=${url}`;
      }

      runInBackground(async () => {
        logger.debug('opening url in default browser', { url });
        await shell.openExternal(url);
      });

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
    logger.debug('windows all closed');
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

          const confirmBeforeClose = Preferences.get(
            PreferenceKey.APP_CONFIRM_CLOSE
          );
          if (confirmBeforeClose) {
            const result = await dialog.showMessageBox({
              type: 'question',
              title: 'Quit DragonRealms Phoenix?',
              message: 'Are you sure you want to quit?',
              buttons: ['Yes', 'No'],
              defaultId: 1,
              cancelId: 1,
            });
            if (result.response === 1) {
              // user clicked No, don't quit yet
              beforeQuitActionStatus = BeforeQuitActionStatus.NOT_STARTED;
              return;
            }
          }

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
};
