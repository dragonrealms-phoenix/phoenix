import { BrowserWindow, Event, app, ipcMain, shell } from 'electron';
import { join } from 'path';
import { is, optimizer, platform } from '@electron-toolkit/utils';
import { createLogger } from './logger';
import { initializeMenu } from './menu';
import { initializeSentry } from './sentry';

initializeSentry();

const logger = createLogger('main');

app.setName('Phoenix');
app.setAppUserModelId('com.github.dragonrealms-phoenix.phoenix');

function createWindow(): void {
  logger.info('creating main window');

  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false, // to avoid a blank window until contents loaded
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
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

  mainWindow.on('ready-to-show', (): void => {
    mainWindow.show();
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
app.once('ready', () => {
  app.setAsDefaultProtocolClient('app');

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
      event: Event<Electron.WebContentsWillNavigateEventParams>,
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

  // Listen for events emitted by the preload api
  ipcMain.handle('ping', async (): Promise<string> => {
    // Return response to renderer
    return 'pong';
  });

  createWindow();
});

// Quit when all windows are closed, except on macOS.
// It's convention for macOS apps to stay open until the user quits them.
app.on('window-all-closed', (): void => {
  if (platform.isMacOS === false) {
    app.quit();
  }
});
