import {
  BrowserWindow,
  Menu,
  MenuItemConstructorOptions,
  app,
  shell,
} from 'electron';
import { platform } from '@electron-toolkit/utils';

/**
 * Inspired by RedisInsight
 * https://github.com/RedisInsight/RedisInsight/blob/2.34.0/redisinsight/desktop/src/lib/menu/menu.ts
 */

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: Array<DarwinMenuItemConstructorOptions> | Menu;
}

export const STEP_ZOOM_FACTOR = 0.2;

export function initializeMenu(window: BrowserWindow): void {
  app.setAboutPanelOptions({
    version: `${app.getVersion()}-${import.meta.env.MAIN_VITE_GIT_SHORT_HASH}`,
  });

  const template = getMenuTemplate(window);
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function getMenuTemplate(
  window: BrowserWindow
): Array<Electron.MenuItemConstructorOptions> {
  return platform.isMacOS
    ? buildDarwinTemplate(window)
    : buildDefaultTemplate(window);
}

function getZoomFactor(
  window: BrowserWindow,
  isZoomIn: boolean = false
): number {
  const correctZoomFactor = isZoomIn ? STEP_ZOOM_FACTOR : -STEP_ZOOM_FACTOR;
  const zoomFactor =
    (window?.webContents.getZoomFactor() * 100 + correctZoomFactor * 100) / 100;
  return zoomFactor;
}

function setZoomFactor(window: BrowserWindow, zoomFactor: number): void {
  // TODO: uncomment when we have electron-store
  // electronStore?.set(ElectronStorageItem.zoomFactor, zoomFactor);
  window.webContents.setZoomFactor(zoomFactor);
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
          window.setFullScreen(!window.isFullScreen());
        },
      },
      { type: 'separator' },
      {
        label: 'Reset Zoom',
        accelerator: 'CmdOrCtrl+0',
        click: () => {
          const zoomFactor = 1;
          setZoomFactor(window, zoomFactor);
        },
      },
      {
        label: 'Zoom In',
        accelerator: 'CmdOrCtrl+=',
        click: () => {
          const zoomFactor = getZoomFactor(window, true);
          setZoomFactor(window, zoomFactor);
        },
      },
      {
        label: 'Zoom Out',
        accelerator: 'CmdOrCtrl+-',
        click: () => {
          const zoomFactor = getZoomFactor(window, false);
          setZoomFactor(window, zoomFactor);
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
          shell.openExternal(
            'https://github.com/dragonrealms-phoenix/phoenix#readme'
          );
        },
      },
      {
        label: 'Release Notes',
        click() {
          shell.openExternal(
            'https://github.com/dragonrealms-phoenix/phoenix/releases'
          );
        },
      },
      {
        label: 'Report Issue',
        click() {
          shell.openExternal(
            'https://github.com/dragonrealms-phoenix/phoenix/issues'
          );
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'View License',
        click() {
          shell.openExternal(
            'https://github.com/dragonrealms-phoenix/phoenix/blob/main/LICENSE.md'
          );
        },
      },
      {
        label: 'Privacy Policy',
        click() {
          shell.openExternal(
            'https://github.com/dragonrealms-phoenix/phoenix/blob/main/PRIVACY.md'
          );
        },
      },
      {
        label: 'Security Policy',
        click() {
          shell.openExternal(
            'https://github.com/dragonrealms-phoenix/phoenix/blob/main/SECURITY.md'
          );
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
        type: platform.isLinux ? 'normal' : 'separator',
        visible: false,
      },
    ],
  };

  const subMenuView: MenuItemConstructorOptions = {
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
          // on Linux menubar is hidden on full screen mode
          window.setMenuBarVisibility(true);
        },
      },
      { type: 'separator' },
      {
        label: 'Reset &Zoom',
        accelerator: 'Ctrl+0',
        click: () => {
          const zoomFactor = 1;
          setZoomFactor(window, zoomFactor);
        },
      },
      {
        label: 'Zoom &In',
        accelerator: 'Ctrl+=',
        click: () => {
          const zoomFactor = getZoomFactor(window, true);
          setZoomFactor(window, zoomFactor);
        },
      },
      {
        label: 'Zoom &Out',
        accelerator: 'Ctrl+-',
        click: () => {
          const zoomFactor = getZoomFactor(window, false);
          setZoomFactor(window, zoomFactor);
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
          shell.openExternal(
            'https://github.com/dragonrealms-phoenix/phoenix#readme'
          );
        },
      },
      {
        label: 'Release Notes',
        click() {
          shell.openExternal(
            'https://github.com/dragonrealms-phoenix/phoenix/releases'
          );
        },
      },
      {
        label: 'Report Issue',
        click() {
          shell.openExternal(
            'https://github.com/dragonrealms-phoenix/phoenix/issues'
          );
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'View License',
        click() {
          shell.openExternal(
            'https://github.com/dragonrealms-phoenix/phoenix/blob/main/LICENSE.md'
          );
        },
      },
      {
        label: 'Privacy Policy',
        click() {
          shell.openExternal(
            'https://github.com/dragonrealms-phoenix/phoenix/blob/main/PRIVACY.md'
          );
        },
      },
      {
        label: 'Security Policy',
        click() {
          shell.openExternal(
            'https://github.com/dragonrealms-phoenix/phoenix/blob/main/SECURITY.md'
          );
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
