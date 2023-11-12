import type { BrowserWindow, MenuItemConstructorOptions } from 'electron';
import { Menu, app, shell } from 'electron';
import { runInBackground } from '../../common/async';

/**
 * Inspired by RedisInsight
 * https://github.com/RedisInsight/RedisInsight/blob/2.34.0/redisinsight/desktop/src/lib/menu/menu.ts
 */

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: Array<DarwinMenuItemConstructorOptions> | Menu;
}

function initializeMenu(window: BrowserWindow): void {
  const template = getMenuTemplate(window);
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function getMenuTemplate(
  window: BrowserWindow
): Array<Electron.MenuItemConstructorOptions> {
  return process.platform === 'darwin'
    ? buildDarwinTemplate(window)
    : buildDefaultTemplate(window);
}

/**
 * Gets the current zoom factor of the window.
 * Returns a value between 0 < zoomFactor <= 1
 */
function getZoomFactor(window: BrowserWindow): number {
  return window.webContents.getZoomFactor();
}

/**
 * Set the zoom factor of the window.
 * Provide a value between 0 < zoomFactor <= 1
 */
function setZoomFactor(window: BrowserWindow, zoomFactor: number): void {
  window.webContents.setZoomFactor(zoomFactor);
}

function resetZoomFactor(window: BrowserWindow): void {
  const zoomFactor = 1;
  setZoomFactor(window, zoomFactor);
}

function increaseZoomFactor(window: BrowserWindow): void {
  const zoomFactor = getZoomFactor(window) + 0.2;
  setZoomFactor(window, zoomFactor);
}

function decreaseZoomFactor(window: BrowserWindow): void {
  // Set lower bound to avoid error when zoom factor is too small.
  const zoomFactor = Math.max(0.2, getZoomFactor(window) - 0.2);
  setZoomFactor(window, zoomFactor);
}

function buildDarwinTemplate(
  window: BrowserWindow
): Array<MenuItemConstructorOptions> {
  const subMenuApp: DarwinMenuItemConstructorOptions = {
    label: app.name,
    submenu: [
      {
        label: `About ${app.name}`,
        selector: 'orderFrontStandardAboutPanel:',
      },
      { type: 'separator' },
      {
        label: `Hide ${app.name}`,
        accelerator: 'Command+H',
        selector: 'hide:',
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Shift+H',
        selector: 'hideOtherApplications:',
      },
      {
        label: 'Show All',
        selector: 'unhideAllApplications:',
      },
      { type: 'separator' },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: () => {
          app.quit();
        },
      },
    ],
  };

  const subMenuEdit: DarwinMenuItemConstructorOptions = {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'Command+Z',
        selector: 'undo:',
      },
      {
        label: 'Redo',
        accelerator: 'Shift+Command+Z',
        selector: 'redo:',
      },
      { type: 'separator' },
      {
        label: 'Cut',
        accelerator: 'Command+X',
        selector: 'cut:',
      },
      {
        label: 'Copy',
        accelerator: 'Command+C',
        selector: 'copy:',
      },
      {
        label: 'Paste',
        accelerator: 'Command+V',
        selector: 'paste:',
      },
      {
        label: 'Select All',
        accelerator: 'Command+A',
        selector: 'selectAll:',
      },
    ],
  };

  const subMenuView: MenuItemConstructorOptions = {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'Command+R',
        click: () => {
          window.webContents.reload();
        },
      },
      { type: 'separator' },
      {
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+Command+F',
        click: () => {
          const isFullScreen = window.isFullScreen();
          window.setFullScreen(!isFullScreen);
        },
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: 'Alt+Command+I',
        visible: !app.isPackaged,
        click: () => {
          window.webContents.toggleDevTools();
        },
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
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'Command+M',
        selector: 'performMiniaturize:',
      },
      {
        label: 'Close',
        accelerator: 'Command+W',
        click: () => {
          window.close();
        },
      },
      {
        type: 'separator',
      },
    ],
  };

  const subMenuHelp: MenuItemConstructorOptions = {
    label: 'Help',
    submenu: [
      {
        label: 'Documentation',
        click() {
          runInBackground(async () => {
            await shell.openExternal(
              'https://github.com/dragonrealms-phoenix/phoenix#readme'
            );
          });
        },
      },
      {
        label: 'Release Notes',
        click() {
          runInBackground(async () => {
            await shell.openExternal(
              'https://github.com/dragonrealms-phoenix/phoenix/releases'
            );
          });
        },
      },
      {
        label: 'Report Issue',
        click() {
          runInBackground(async () => {
            await shell.openExternal(
              'https://github.com/dragonrealms-phoenix/phoenix/issues'
            );
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
            await shell.openExternal(
              'https://github.com/dragonrealms-phoenix/phoenix/blob/main/LICENSE.md'
            );
          });
        },
      },
      {
        label: 'Privacy Policy',
        click() {
          runInBackground(async () => {
            await shell.openExternal(
              'https://github.com/dragonrealms-phoenix/phoenix/blob/main/PRIVACY.md'
            );
          });
        },
      },
      {
        label: 'Security Policy',
        click() {
          runInBackground(async () => {
            await shell.openExternal(
              'https://github.com/dragonrealms-phoenix/phoenix/blob/main/SECURITY.md'
            );
          });
        },
      },
    ],
  };

  return [subMenuApp, subMenuEdit, subMenuWindow, subMenuView, subMenuHelp];
}

function buildDefaultTemplate(
  window: BrowserWindow
): Array<MenuItemConstructorOptions> {
  const subMenuWindow: MenuItemConstructorOptions = {
    label: '&Window',
    submenu: [
      {
        label: '&Close',
        accelerator: 'Ctrl+W',
        click: () => {
          window.close();
        },
      },
      // type separator cannot be invisible
      {
        label: '',
        type: process.platform === 'linux' ? 'normal' : 'separator',
        visible: false,
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
            accelerator: 'Ctrl+R',
            click: () => {
              window.webContents.reload();
            },
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
      {
        label: 'Documentation',
        click() {
          runInBackground(async () => {
            await shell.openExternal(
              'https://github.com/dragonrealms-phoenix/phoenix#readme'
            );
          });
        },
      },
      {
        label: 'Release Notes',
        click() {
          runInBackground(async () => {
            await shell.openExternal(
              'https://github.com/dragonrealms-phoenix/phoenix/releases'
            );
          });
        },
      },
      {
        label: 'Report Issue',
        click() {
          runInBackground(async () => {
            await shell.openExternal(
              'https://github.com/dragonrealms-phoenix/phoenix/issues'
            );
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
            await shell.openExternal(
              'https://github.com/dragonrealms-phoenix/phoenix/blob/main/LICENSE.md'
            );
          });
        },
      },
      {
        label: 'Privacy Policy',
        click() {
          runInBackground(async () => {
            await shell.openExternal(
              'https://github.com/dragonrealms-phoenix/phoenix/blob/main/PRIVACY.md'
            );
          });
        },
      },
      {
        label: 'Security Policy',
        click() {
          runInBackground(async () => {
            await shell.openExternal(
              'https://github.com/dragonrealms-phoenix/phoenix/blob/main/SECURITY.md'
            );
          });
        },
      },
      { type: 'separator' },
      {
        label: `About ${app.name}`,
        click: () => {
          app.showAboutPanel();
        },
      },
    ],
  };

  return [subMenuWindow, subMenuView, subMenuHelp];
}

export { initializeMenu };
