import {
  BrowserWindow,
  Menu,
  MenuItemConstructorOptions,
  app,
  shell,
} from 'electron';

/**
 * Inspired by RedisInsight
 * https://github.com/RedisInsight/RedisInsight/blob/2.34.0/redisinsight/desktop/src/lib/menu/menu.ts
 */

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: Array<DarwinMenuItemConstructorOptions> | Menu;
}

export const STEP_ZOOM_FACTOR = 0.2;

export class MenuBuilder {
  // Used when changing the zoom factor.
  public mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  /**
   * Builds and sets the application menu.
   * Returns a reference to the menu as a convenience.
   */
  public buildMenu(): Menu {
    const template =
      process.platform === 'darwin'
        ? this.buildDarwinTemplate()
        : this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(
      template as Array<MenuItemConstructorOptions>
    );

    Menu.setApplicationMenu(menu);

    return menu;
  }

  private getZoomFactor(isZoomIn: boolean = false): number {
    const correctZoomFactor = isZoomIn ? STEP_ZOOM_FACTOR : -STEP_ZOOM_FACTOR;
    const zoomFactor =
      (this.mainWindow?.webContents.getZoomFactor() * 100 +
        correctZoomFactor * 100) /
      100;
    return zoomFactor;
  }

  private setZoomFactor(zoomFactor: number): void {
    // TODO: uncomment when we have electron-store
    // electronStore?.set(ElectronStorageItem.zoomFactor, zoomFactor);
    this.mainWindow.webContents.setZoomFactor(zoomFactor);
  }

  private buildDarwinTemplate(): Array<MenuItemConstructorOptions> {
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
        { label: 'Show All', selector: 'unhideAllApplications:' },
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
        { label: 'Undo', accelerator: 'Command+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+Command+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'Command+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' },
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
            this.mainWindow.webContents.reload();
          },
        },
        { type: 'separator' },
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'Alt+Command+I',
          click: () => {
            this.mainWindow.webContents.toggleDevTools();
          },
        },
        { type: 'separator' },
        {
          label: 'Reset Zoom',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            const zoomFactor = 1;
            this.setZoomFactor(zoomFactor);
          },
        },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+=',
          click: () => {
            const zoomFactor = this.getZoomFactor(true);
            this.setZoomFactor(zoomFactor);
          },
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            const zoomFactor = this.getZoomFactor();
            this.setZoomFactor(zoomFactor);
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
            this.mainWindow.close();
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

  private buildDefaultTemplate(): Array<MenuItemConstructorOptions> {
    const templateDefault: Array<MenuItemConstructorOptions> = [
      {
        label: '&Window',
        submenu: [
          {
            label: '&Close',
            accelerator: 'Ctrl+W',
            click: () => {
              this.mainWindow.close();
            },
          },
          // type separator cannot be invisible
          {
            label: '',
            type: process.platform !== 'linux' ? 'separator' : 'normal',
            visible: false,
          },
        ],
      },
      {
        label: '&View',
        submenu: [
          {
            label: '&Reload',
            accelerator: 'Ctrl+R',
            click: () => {
              this.mainWindow.webContents.reload();
            },
          },
          { type: 'separator' },
          {
            label: 'Toggle &Full Screen',
            accelerator: 'F11',
            click: () => {
              this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
              // on Linux menubar is hidden on full screen mode
              this.mainWindow.setMenuBarVisibility(true);
            },
          },
          {
            label: 'Toggle &Developer Tools',
            accelerator: 'Ctrl+Shift+I',
            click: () => {
              this.mainWindow.webContents.toggleDevTools();
            },
          },
          { type: 'separator' },
          {
            label: 'Reset &Zoom',
            accelerator: 'Ctrl+0',
            click: () => {
              const zoomFactor = 1;
              this.setZoomFactor(zoomFactor);
            },
          },
          {
            label: 'Zoom &In',
            accelerator: 'Ctrl+=',
            click: () => {
              const zoomFactor = this.getZoomFactor(true);
              this.setZoomFactor(zoomFactor);
            },
          },
          {
            label: 'Zoom &Out',
            accelerator: 'Ctrl+-',
            click: () => {
              const zoomFactor = this.getZoomFactor();
              this.setZoomFactor(zoomFactor);
            },
          },
        ],
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'License Terms',
            click() {
              shell.openExternal(
                'https://github.com/dragonrealms-phoenix/phoenix/blob/main/LICENSE'
              );
            },
          },
          {
            label: 'Submit a Bug or Idea',
            click() {
              shell.openExternal(
                'https://github.com/dragonrealms-phoenix/phoenix/issues'
              );
            },
          },
          {
            label: 'Documentation',
            click() {
              shell.openExternal(
                'https://github.com/dragonrealms-phoenix/phoenix#readme'
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
      },
    ];

    return templateDefault;
  }
}
