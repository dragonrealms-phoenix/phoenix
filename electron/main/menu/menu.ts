// Inspired by RedisInsight
// https://github.com/RedisInsight/RedisInsight/blob/2.34.0/redisinsight/desktop/src/lib/menu/menu.ts

import type { BrowserWindow, MenuItemConstructorOptions } from 'electron';
import { Menu, app, shell } from 'electron';
import { runInBackground } from '..//async/run-in-background.js';
import {
  ELANTHIPEDIA_URL,
  PHOENIX_DOCS_URL,
  PHOENIX_ISSUES_URL,
  PHOENIX_LICENSE_URL,
  PHOENIX_PRIVACY_URL,
  PHOENIX_RELEASES_URL,
  PHOENIX_SECURITY_URL,
  PLAY_NET_URL,
} from '../../common/data/urls.js';
import { Preferences } from '../preference/preference.instance.js';
import { PreferenceKey } from '../preference/types.js';
import {
  getConfirmBeforeClose,
  setConfirmBeforeClose,
  toggleConfirmBeforeClose,
} from './utils/confirm-before-close.js';
import {
  decreaseZoomFactor,
  increaseZoomFactor,
  resetZoomFactor,
  setZoomFactor,
} from './utils/zoom-factor.js';

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: Array<DarwinMenuItemConstructorOptions> | Menu;
}

export const initializeMenu = (window: BrowserWindow): void => {
  const template = getMenuTemplate(window);
  const menu = Menu.buildFromTemplate(template);

  Menu.setApplicationMenu(menu);

  setZoomFactor(window, Preferences.get(PreferenceKey.APP_ZOOM_FACTOR, 1));
  setConfirmBeforeClose(Preferences.get(PreferenceKey.APP_CONFIRM_CLOSE, true));
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
      {
        label: 'Open Config Folder',
        click() {
          runInBackground(async () => {
            await shell.openPath(app.getPath('userData'));
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

  const subMenuView: DarwinMenuItemConstructorOptions = {
    label: 'View',
    role: 'viewMenu',
    submenu: [
      {
        label: 'Reload',
        role: 'reload',
        accelerator: 'Command+R',
        visible: !app.isPackaged,
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
            visible: !app.isPackaged,
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
