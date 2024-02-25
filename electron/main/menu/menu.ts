import type { BrowserWindow, MenuItemConstructorOptions } from 'electron';
import { Menu, app, shell } from 'electron';
import { runInBackground } from '../../common/async';
import {
  ELANTHIPEDIA_URL,
  PHOENIX_DOCS_URL,
  PHOENIX_ISSUES_URL,
  PHOENIX_LICENSE_URL,
  PHOENIX_PRIVACY_URL,
  PHOENIX_RELEASES_URL,
  PHOENIX_SECURITY_URL,
  PLAY_NET_URL,
} from '../../common/data/urls';
import { PreferenceKey, Preferences } from '../preference';
import { getMenuItemById } from './menu.utils';

/**
 * Inspired by RedisInsight
 * https://github.com/RedisInsight/RedisInsight/blob/2.34.0/redisinsight/desktop/src/lib/menu/menu.ts
 */

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: Array<DarwinMenuItemConstructorOptions> | Menu;
}

// -- Zoom Factor -- //

const loadZoomFactorPreference = (window: BrowserWindow): void => {
  runInBackground(async () => {
    const zoomFactor = await Preferences.get(PreferenceKey.WINDOW_ZOOM_FACTOR);
    if (zoomFactor !== undefined) {
      setZoomFactor(window, zoomFactor);
    }
  });
};

const saveZoomFactorPreference = (zoomFactor: number): void => {
  runInBackground(async () => {
    await Preferences.set(PreferenceKey.WINDOW_ZOOM_FACTOR, zoomFactor);
  });
};

/**
 * Gets the current zoom factor of the window.
 * Returns a value between 0 < zoomFactor <= 1
 */
const getZoomFactor = (window: BrowserWindow): number => {
  return window.webContents.getZoomFactor();
};

/**
 * Set the zoom factor of the window.
 * Provide a value between 0 < zoomFactor <= 1
 */
const setZoomFactor = (window: BrowserWindow, zoomFactor: number): void => {
  window.webContents.setZoomFactor(zoomFactor);
  saveZoomFactorPreference(zoomFactor);
};

const resetZoomFactor = (window: BrowserWindow): void => {
  const zoomFactor = 1;
  setZoomFactor(window, zoomFactor);
};

const increaseZoomFactor = (window: BrowserWindow): void => {
  const zoomFactor = getZoomFactor(window) + 0.2;
  setZoomFactor(window, zoomFactor);
};

const decreaseZoomFactor = (window: BrowserWindow): void => {
  // Set lower bound to avoid error when zoom factor is too small.
  const zoomFactor = Math.max(0.2, getZoomFactor(window) - 0.2);
  setZoomFactor(window, zoomFactor);
};

// -- Confirm Before Close -- //

let confirmBeforeClose = true;

const loadConfirmBeforeClosePreference = (): void => {
  runInBackground(async () => {
    const value = await Preferences.get(PreferenceKey.WINDOW_CONFIRM_ON_CLOSE);
    if (value !== undefined) {
      setConfirmBeforeClose(value);
    }
  });
};

const saveConfirmBeforeClosePreference = (value: boolean): void => {
  runInBackground(async () => {
    await Preferences.set(PreferenceKey.WINDOW_CONFIRM_ON_CLOSE, value);
  });
};

const getConfirmBeforeClose = (): boolean => {
  return confirmBeforeClose;
};

const setConfirmBeforeClose = (value: boolean): void => {
  confirmBeforeClose = value;
  saveConfirmBeforeClosePreference(confirmBeforeClose);

  // Update the menu item checkbox so that visually it matches the preference.
  const menuItem = getMenuItemById('confirm-before-close');
  if (menuItem) {
    menuItem.checked = confirmBeforeClose;
  }
};

const toggleConfirmBeforeClose = (): void => {
  setConfirmBeforeClose(!confirmBeforeClose);
};

// -- Menu -- //

export const initializeMenu = (window: BrowserWindow): void => {
  const template = getMenuTemplate(window);
  const menu = Menu.buildFromTemplate(template);

  Menu.setApplicationMenu(menu);

  loadZoomFactorPreference(window);
  loadConfirmBeforeClosePreference();
};

// -- Menu Builders -- //

const getMenuTemplate = (
  window: BrowserWindow
): Array<Electron.MenuItemConstructorOptions> => {
  return process.platform === 'darwin'
    ? buildDarwinTemplate(window)
    : buildDefaultTemplate(window);
};

const buildDarwinTemplate = (
  window: BrowserWindow
): Array<MenuItemConstructorOptions> => {
  const subMenuApp: DarwinMenuItemConstructorOptions = {
    label: app.name,
    role: 'appMenu',
    submenu: [
      {
        label: `About ${app.name}`,
        role: 'about',
        selector: 'orderFrontStandardAboutPanel:',
      },
      { type: 'separator' },
      {
        label: `Hide ${app.name}`,
        role: 'hide',
        accelerator: 'Command+H',
        selector: 'hide:',
      },
      {
        label: 'Hide Others',
        role: 'hideOthers',
        accelerator: 'Command+Shift+H',
        selector: 'hideOtherApplications:',
      },
      {
        label: 'Show All',
        role: 'unhide',
        selector: 'unhideAllApplications:',
      },
      { type: 'separator' },
      {
        id: 'confirm-before-close', // need id so can reference it later
        label: 'Warn Before Quitting (⌘Q)', // same lingo as Chrome browser
        type: 'checkbox',
        checked: getConfirmBeforeClose(),
        click: () => {
          toggleConfirmBeforeClose();
        },
      },
      { type: 'separator' },
      {
        label: 'Quit Phoenix',
        role: 'quit',
        accelerator: 'Command+Q',
      },
    ],
  };

  const subMenuFile: DarwinMenuItemConstructorOptions = {
    label: 'File',
    role: 'fileMenu',
    submenu: [
      {
        label: 'Open Logs Folder',
        click() {
          runInBackground(async () => {
            await shell.openPath(app.getPath('logs'));
          });
        },
      },
    ],
  };

  const subMenuEdit: DarwinMenuItemConstructorOptions = {
    label: 'Edit',
    role: 'editMenu',
    submenu: [
      {
        label: 'Undo',
        role: 'undo',
        accelerator: 'Command+Z',
        selector: 'undo:',
      },
      {
        label: 'Redo',
        role: 'redo',
        accelerator: 'Shift+Command+Z',
        selector: 'redo:',
      },
      { type: 'separator' },
      {
        label: 'Cut',
        role: 'cut',
        accelerator: 'Command+X',
        selector: 'cut:',
      },
      {
        label: 'Copy',
        role: 'copy',
        accelerator: 'Command+C',
        selector: 'copy:',
      },
      {
        label: 'Paste',
        role: 'paste',
        accelerator: 'Command+V',
        selector: 'paste:',
      },
      {
        label: 'Select All',
        role: 'selectAll',
        accelerator: 'Command+A',
        selector: 'selectAll:',
      },
    ],
  };

  const subMenuView: DarwinMenuItemConstructorOptions = {
    label: 'View',
    role: 'viewMenu',
    submenu: [
      {
        label: 'Reload',
        role: 'reload',
        accelerator: 'Command+R',
      },
      { type: 'separator' },
      {
        label: 'Toggle Full Screen',
        role: 'togglefullscreen',
        accelerator: 'Ctrl+Command+F',
      },
      {
        label: 'Toggle Developer Tools',
        role: 'toggleDevTools',
        accelerator: 'Alt+Command+I',
        visible: !app.isPackaged,
      },
      { type: 'separator' },
      {
        label: 'Reset Zoom',
        accelerator: 'CmdOrCtrl+0',
        click: () => {
          resetZoomFactor(window);
        },
      },
      {
        label: 'Zoom In',
        accelerator: 'CmdOrCtrl+=',
        click: () => {
          increaseZoomFactor(window);
        },
      },
      {
        label: 'Zoom Out',
        accelerator: 'CmdOrCtrl+-',
        click: () => {
          decreaseZoomFactor(window);
        },
      },
    ],
  };

  const subMenuWindow: DarwinMenuItemConstructorOptions = {
    label: 'Window',
    role: 'windowMenu',
    submenu: [
      {
        label: 'Minimize',
        role: 'minimize',
        accelerator: 'Command+M',
        selector: 'performMiniaturize:',
      },
      {
        label: 'Close',
        role: 'close',
        accelerator: 'Command+W',
      },
      {
        type: 'separator',
      },
    ],
  };

  const subMenuHelp: DarwinMenuItemConstructorOptions = {
    label: 'Help',
    role: 'help',
    submenu: buildCommonHelpMenuItems(),
  };

  return [
    subMenuApp,
    subMenuFile,
    subMenuEdit,
    subMenuWindow,
    subMenuView,
    subMenuHelp,
  ];
};

const buildDefaultTemplate = (
  window: BrowserWindow
): Array<MenuItemConstructorOptions> => {
  const subMenuWindow: MenuItemConstructorOptions = {
    label: '&Window',
    submenu: [
      {
        label: '&Close',
        role: 'close',
        accelerator: 'Ctrl+W',
      },
      // type separator cannot be invisible
      {
        label: '',
        type: process.platform === 'linux' ? 'normal' : 'separator',
        visible: false,
      },
    ],
  };

  const subMenuFile: MenuItemConstructorOptions = {
    label: 'File',
    submenu: [
      {
        label: 'Open Logs Folder',
        click() {
          runInBackground(async () => {
            await shell.openPath(app.getPath('logs'));
          });
        },
      },
    ],
  };

  const subMenuView: MenuItemConstructorOptions = !window
    ? {}
    : {
        label: '&View',
        submenu: [
          {
            label: '&Reload',
            role: 'reload',
            accelerator: 'Ctrl+R',
          },
          { type: 'separator' },
          {
            label: 'Toggle &Full Screen',
            accelerator: 'F11',
            click: () => {
              window.setFullScreen(!window.isFullScreen());
              // on Linux, menubar is hidden on full screen mode
              window.setMenuBarVisibility(true);
            },
          },
          { type: 'separator' },
          {
            label: 'Reset &Zoom',
            accelerator: 'Ctrl+0',
            click: () => {
              resetZoomFactor(window);
            },
          },
          {
            label: 'Zoom &In',
            accelerator: 'Ctrl+=',
            click: () => {
              increaseZoomFactor(window);
            },
          },
          {
            label: 'Zoom &Out',
            accelerator: 'Ctrl+-',
            click: () => {
              decreaseZoomFactor(window);
            },
          },
        ],
      };

  const subMenuHelp: MenuItemConstructorOptions = {
    label: 'Help',
    submenu: [
      ...buildCommonHelpMenuItems(),
      { type: 'separator' },
      {
        label: `About ${app.name}`,
        role: 'about',
      },
    ],
  };

  return [subMenuFile, subMenuView, subMenuWindow, subMenuHelp];
};

const buildCommonHelpMenuItems = (): Array<MenuItemConstructorOptions> => {
  return [
    {
      label: 'Documentation',
      click() {
        runInBackground(async () => {
          await shell.openExternal(PHOENIX_DOCS_URL);
        });
      },
    },
    {
      label: 'Release Notes',
      click() {
        runInBackground(async () => {
          await shell.openExternal(PHOENIX_RELEASES_URL);
        });
      },
    },
    {
      label: 'Submit Feedback',
      click() {
        runInBackground(async () => {
          await shell.openExternal(PHOENIX_ISSUES_URL);
        });
      },
    },
    {
      type: 'separator',
    },
    {
      label: 'View License',
      click() {
        runInBackground(async () => {
          await shell.openExternal(PHOENIX_LICENSE_URL);
        });
      },
    },
    {
      label: 'Privacy Policy',
      click() {
        runInBackground(async () => {
          await shell.openExternal(PHOENIX_PRIVACY_URL);
        });
      },
    },
    {
      label: 'Security Policy',
      click() {
        runInBackground(async () => {
          await shell.openExternal(PHOENIX_SECURITY_URL);
        });
      },
    },
    {
      type: 'separator',
    },
    {
      label: 'Play.net',
      click() {
        runInBackground(async () => {
          await shell.openExternal(PLAY_NET_URL);
        });
      },
    },
    {
      label: 'Elanthipedia',
      click() {
        runInBackground(async () => {
          await shell.openExternal(ELANTHIPEDIA_URL);
        });
      },
    },
  ];
};
