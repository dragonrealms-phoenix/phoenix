import type { BrowserWindow } from 'electron';
import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ELANTHIPEDIA_URL,
  PHOENIX_DOCS_URL,
  PHOENIX_ISSUES_URL,
  PHOENIX_LICENSE_URL,
  PHOENIX_PRIVACY_URL,
  PHOENIX_RELEASES_URL,
  PHOENIX_SECURITY_URL,
  PLAY_NET_URL,
} from '../../../common/data/urls.js';
import type { Maybe } from '../../../common/types.js';
import { initializeMenu } from '../menu.js';

const {
  mockBrowserWindow,
  mockZoomFactorModule,
  mockConfirmBeforeCloseModule,
  mockElectronMenuBuildFromTemplate,
  mockElectronSetApplicationMenu,
  mockElectronShellOpenPath,
  mockElectronShellOpenExternal,
} = await vi.hoisted(async () => {
  const mockBrowserWindow = {
    isFullScreen: vi.fn(),
    setFullScreen: vi.fn(),
    setMenuBarVisibility: vi.fn(),
  } as unknown as BrowserWindow;

  const mockZoomFactorModule = {
    loadZoomFactorPreference: vi.fn(),
    decreaseZoomFactor: vi.fn(),
    increaseZoomFactor: vi.fn(),
    resetZoomFactor: vi.fn(),
  };

  const mockConfirmBeforeCloseModule = {
    loadConfirmBeforeClosePreference: vi.fn(),
    getConfirmBeforeClose: vi.fn(),
    toggleConfirmBeforeClose: vi.fn(),
  };

  const mockElectronMenuBuildFromTemplate = vi.fn();
  const mockElectronSetApplicationMenu = vi.fn();
  const mockElectronShellOpenPath = vi.fn();
  const mockElectronShellOpenExternal = vi.fn();

  return {
    mockBrowserWindow,
    mockZoomFactorModule,
    mockConfirmBeforeCloseModule,
    mockElectronMenuBuildFromTemplate,
    mockElectronSetApplicationMenu,
    mockElectronShellOpenPath,
    mockElectronShellOpenExternal,
  };
});

vi.mock('../utils/zoom-factor.js', () => {
  return mockZoomFactorModule;
});

vi.mock('../utils/confirm-before-close.js', () => {
  return mockConfirmBeforeCloseModule;
});

vi.mock('electron', () => {
  return {
    Menu: {
      buildFromTemplate: mockElectronMenuBuildFromTemplate,
      setApplicationMenu: mockElectronSetApplicationMenu,
    },
    app: {
      name: 'test-app-name',
      getPath: vi.fn(() => '/path/to/logs'),
    },
    shell: {
      openPath: mockElectronShellOpenPath,
      openExternal: mockElectronShellOpenExternal,
    },
  };
});

vi.mock('../../logger/logger.factory.ts');

const getSubMenuItemByLabel = (options: {
  menu: Electron.MenuItemConstructorOptions;
  label: string;
}): Maybe<Electron.MenuItemConstructorOptions> => {
  const { menu, label } = options;
  const submenu = menu.submenu;
  if (Array.isArray(submenu)) {
    return submenu.find((item) => item.label === label);
  }
};

const getMenuItemClickFn = (
  menuItem: Maybe<Electron.MenuItemConstructorOptions>
): (() => void) => {
  expect(menuItem).toBeDefined();
  expect(menuItem?.click).toEqual(expect.any(Function));

  // The click function expects three arguments
  // but our callbacks never use them so casting to ignore them.
  const clickFn = menuItem?.click as () => void;

  return clickFn;
};

describe('menu', () => {
  let processPlatformSpy: MockInstance;

  beforeEach(() => {
    processPlatformSpy = vi.spyOn(process, 'platform', 'get');
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('platform: darwin', () => {
    beforeEach(() => {
      processPlatformSpy.mockReturnValue('darwin');
    });

    describe('#initializeMenu', () => {
      it('initializes the application menu', async () => {
        initializeMenu(mockBrowserWindow);

        expect(mockElectronMenuBuildFromTemplate).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              label: 'test-app-name',
              role: 'appMenu',
              submenu: expect.arrayContaining([
                expect.objectContaining({
                  label: 'About test-app-name',
                  role: 'about',
                  selector: 'orderFrontStandardAboutPanel:',
                }),
                expect.objectContaining({
                  type: 'separator',
                }),
                expect.objectContaining({
                  label: 'Hide test-app-name',
                  role: 'hide',
                  accelerator: 'Command+H',
                  selector: 'hide:',
                }),
                expect.objectContaining({
                  label: 'Hide Others',
                  role: 'hideOthers',
                  accelerator: 'Command+Shift+H',
                  selector: 'hideOtherApplications:',
                }),
                expect.objectContaining({
                  label: 'Show All',
                  role: 'unhide',
                  selector: 'unhideAllApplications:',
                }),
                expect.objectContaining({
                  type: 'separator',
                }),
                expect.objectContaining({
                  id: 'confirm-before-close',
                  label: 'Warn Before Quitting (⌘Q)',
                  type: 'checkbox',
                }),
                expect.objectContaining({
                  type: 'separator',
                }),
                expect.objectContaining({
                  label: 'Quit Phoenix',
                  role: 'quit',
                  accelerator: 'Command+Q',
                }),
              ]),
            }),

            expect.objectContaining({
              label: 'File',
              role: 'fileMenu',
              submenu: expect.arrayContaining([
                expect.objectContaining({
                  label: 'Open Logs Folder',
                }),
                expect.objectContaining({
                  label: 'Open Config Folder',
                }),
              ]),
            }),

            expect.objectContaining({
              label: 'Edit',
              role: 'editMenu',
              submenu: expect.arrayContaining([
                expect.objectContaining({
                  label: 'Undo',
                  role: 'undo',
                  accelerator: 'Command+Z',
                  selector: 'undo:',
                }),
                expect.objectContaining({
                  label: 'Redo',
                  role: 'redo',
                  accelerator: 'Shift+Command+Z',
                  selector: 'redo:',
                }),
                expect.objectContaining({
                  type: 'separator',
                }),
                expect.objectContaining({
                  label: 'Cut',
                  role: 'cut',
                  accelerator: 'Command+X',
                  selector: 'cut:',
                }),
                expect.objectContaining({
                  label: 'Copy',
                  role: 'copy',
                  accelerator: 'Command+C',
                  selector: 'copy:',
                }),
                expect.objectContaining({
                  label: 'Paste',
                  role: 'paste',
                  accelerator: 'Command+V',
                  selector: 'paste:',
                }),
                expect.objectContaining({
                  label: 'Select All',
                  role: 'selectAll',
                  accelerator: 'Command+A',
                  selector: 'selectAll:',
                }),
              ]),
            }),

            expect.objectContaining({
              label: 'View',
              role: 'viewMenu',
              submenu: expect.arrayContaining([
                expect.objectContaining({
                  label: 'Reload',
                  role: 'reload',
                  accelerator: 'Command+R',
                }),
                expect.objectContaining({
                  type: 'separator',
                }),
                expect.objectContaining({
                  label: 'Toggle Full Screen',
                  role: 'togglefullscreen',
                  accelerator: 'Ctrl+Command+F',
                }),
                expect.objectContaining({
                  label: 'Toggle Developer Tools',
                  role: 'toggleDevTools',
                  accelerator: 'Alt+Command+I',
                }),
                expect.objectContaining({
                  type: 'separator',
                }),
                expect.objectContaining({
                  label: 'Reset Zoom',
                  accelerator: 'CmdOrCtrl+0',
                }),
                expect.objectContaining({
                  label: 'Zoom In',
                  accelerator: 'CmdOrCtrl+=',
                }),
                expect.objectContaining({
                  label: 'Zoom Out',
                  accelerator: 'CmdOrCtrl+-',
                }),
              ]),
            }),

            expect.objectContaining({
              label: 'Window',
              role: 'windowMenu',
              submenu: expect.arrayContaining([
                expect.objectContaining({
                  label: 'Minimize',
                  role: 'minimize',
                  accelerator: 'Command+M',
                  selector: 'performMiniaturize:',
                }),
                expect.objectContaining({
                  label: 'Close',
                  role: 'close',
                  accelerator: 'Command+W',
                }),
                expect.objectContaining({
                  type: 'separator',
                }),
              ]),
            }),

            expect.objectContaining({
              label: 'Help',
              role: 'help',
              submenu: expect.arrayContaining([
                expect.objectContaining({
                  label: 'Documentation',
                }),
                expect.objectContaining({
                  label: 'Release Notes',
                }),
                expect.objectContaining({
                  label: 'Submit Feedback',
                }),
                expect.objectContaining({
                  type: 'separator',
                }),
                expect.objectContaining({
                  label: 'View License',
                }),
                expect.objectContaining({
                  label: 'Privacy Policy',
                }),
                expect.objectContaining({
                  label: 'Security Policy',
                }),
                expect.objectContaining({
                  type: 'separator',
                }),
                expect.objectContaining({
                  label: 'Play.net',
                }),
                expect.objectContaining({
                  label: 'Elanthipedia',
                }),
              ]),
            }),
          ])
        );

        expect(mockElectronSetApplicationMenu).toHaveBeenCalledTimes(1);

        expect(
          mockZoomFactorModule.loadZoomFactorPreference
        ).toHaveBeenCalledTimes(1);

        expect(
          mockConfirmBeforeCloseModule.loadConfirmBeforeClosePreference
        ).toHaveBeenCalledTimes(1);
      });
    });

    describe('#menuItemClick', () => {
      let menus: Array<Electron.MenuItemConstructorOptions>;
      let appMenu: Electron.MenuItemConstructorOptions;
      let fileMenu: Electron.MenuItemConstructorOptions;
      // let editMenu: Electron.MenuItemConstructorOptions;
      let viewMenu: Electron.MenuItemConstructorOptions;
      // let windowMenu: Electron.MenuItemConstructorOptions;
      let helpMenu: Electron.MenuItemConstructorOptions;

      beforeEach(() => {
        initializeMenu(mockBrowserWindow);

        menus = mockElectronMenuBuildFromTemplate.mock.calls[0][0];
        appMenu = menus[0] as Electron.MenuItemConstructorOptions;
        fileMenu = menus[1] as Electron.MenuItemConstructorOptions;
        // editMenu = menus[2] as Electron.MenuItemConstructorOptions;
        // windowMenu = menus[3] as Electron.MenuItemConstructorOptions;
        viewMenu = menus[4] as Electron.MenuItemConstructorOptions;
        helpMenu = menus[5] as Electron.MenuItemConstructorOptions;
      });

      it('App Menu > Warn Before Quitting', async () => {
        expect(
          mockConfirmBeforeCloseModule.toggleConfirmBeforeClose
        ).toHaveBeenCalledTimes(0);

        const menuItemClickFn = getMenuItemClickFn(
          getSubMenuItemByLabel({
            menu: appMenu,
            label: 'Warn Before Quitting (⌘Q)',
          })
        );

        menuItemClickFn();

        expect(
          mockConfirmBeforeCloseModule.toggleConfirmBeforeClose
        ).toHaveBeenCalledTimes(1);
      });

      it('File Menu > Open Logs Folder', async () => {
        expect(mockElectronShellOpenPath).toHaveBeenCalledTimes(0);

        const menuItemClickFn = getMenuItemClickFn(
          getSubMenuItemByLabel({
            menu: fileMenu,
            label: 'Open Logs Folder',
          })
        );

        menuItemClickFn();

        await vi.runAllTimersAsync();

        expect(mockElectronShellOpenPath).toHaveBeenCalledTimes(1);
        expect(mockElectronShellOpenPath).toHaveBeenCalledWith('/path/to/logs');
      });

      it('View Menu > Reset Zoom', async () => {
        expect(mockZoomFactorModule.resetZoomFactor).toHaveBeenCalledTimes(0);

        const menuItemClickFn = getMenuItemClickFn(
          getSubMenuItemByLabel({
            menu: viewMenu,
            label: 'Reset Zoom',
          })
        );

        menuItemClickFn();

        await vi.runAllTimersAsync();

        expect(mockZoomFactorModule.resetZoomFactor).toHaveBeenCalledTimes(1);
      });

      it('View Menu > Zoom In', async () => {
        expect(mockZoomFactorModule.increaseZoomFactor).toHaveBeenCalledTimes(
          0
        );

        const menuItemClickFn = getMenuItemClickFn(
          getSubMenuItemByLabel({
            menu: viewMenu,
            label: 'Zoom In',
          })
        );

        menuItemClickFn();

        await vi.runAllTimersAsync();

        expect(mockZoomFactorModule.increaseZoomFactor).toHaveBeenCalledTimes(
          1
        );
      });

      it('View Menu > Zoom Out', async () => {
        expect(mockZoomFactorModule.decreaseZoomFactor).toHaveBeenCalledTimes(
          0
        );

        const menuItemClickFn = getMenuItemClickFn(
          getSubMenuItemByLabel({
            menu: viewMenu,
            label: 'Zoom Out',
          })
        );

        menuItemClickFn();

        await vi.runAllTimersAsync();

        expect(mockZoomFactorModule.decreaseZoomFactor).toHaveBeenCalledTimes(
          1
        );
      });

      it('Help Menu > Documentation', async () => {
        expect(mockElectronShellOpenExternal).toHaveBeenCalledTimes(0);

        const menuItemClickFn = getMenuItemClickFn(
          getSubMenuItemByLabel({
            menu: helpMenu,
            label: 'Documentation',
          })
        );

        menuItemClickFn();

        await vi.runAllTimersAsync();

        expect(mockElectronShellOpenExternal).toHaveBeenCalledTimes(1);
        expect(mockElectronShellOpenExternal).toHaveBeenCalledWith(
          PHOENIX_DOCS_URL
        );
      });

      it('Help Menu > Release Notes', async () => {
        expect(mockElectronShellOpenExternal).toHaveBeenCalledTimes(0);

        const menuItemClickFn = getMenuItemClickFn(
          getSubMenuItemByLabel({
            menu: helpMenu,
            label: 'Release Notes',
          })
        );

        menuItemClickFn();

        await vi.runAllTimersAsync();

        expect(mockElectronShellOpenExternal).toHaveBeenCalledTimes(1);
        expect(mockElectronShellOpenExternal).toHaveBeenCalledWith(
          PHOENIX_RELEASES_URL
        );
      });

      it('Help Menu > Submit Feedback', async () => {
        expect(mockElectronShellOpenExternal).toHaveBeenCalledTimes(0);

        const menuItemClickFn = getMenuItemClickFn(
          getSubMenuItemByLabel({
            menu: helpMenu,
            label: 'Submit Feedback',
          })
        );

        menuItemClickFn();

        await vi.runAllTimersAsync();

        expect(mockElectronShellOpenExternal).toHaveBeenCalledTimes(1);
        expect(mockElectronShellOpenExternal).toHaveBeenCalledWith(
          PHOENIX_ISSUES_URL
        );
      });

      it('Help Menu > View License', async () => {
        expect(mockElectronShellOpenExternal).toHaveBeenCalledTimes(0);

        const menuItemClickFn = getMenuItemClickFn(
          getSubMenuItemByLabel({
            menu: helpMenu,
            label: 'View License',
          })
        );

        menuItemClickFn();

        await vi.runAllTimersAsync();

        expect(mockElectronShellOpenExternal).toHaveBeenCalledTimes(1);
        expect(mockElectronShellOpenExternal).toHaveBeenCalledWith(
          PHOENIX_LICENSE_URL
        );
      });

      it('Help Menu > Privacy Policy', async () => {
        expect(mockElectronShellOpenExternal).toHaveBeenCalledTimes(0);

        const menuItemClickFn = getMenuItemClickFn(
          getSubMenuItemByLabel({
            menu: helpMenu,
            label: 'Privacy Policy',
          })
        );

        menuItemClickFn();

        await vi.runAllTimersAsync();

        expect(mockElectronShellOpenExternal).toHaveBeenCalledTimes(1);
        expect(mockElectronShellOpenExternal).toHaveBeenCalledWith(
          PHOENIX_PRIVACY_URL
        );
      });

      it('Help Menu > Security Policy', async () => {
        expect(mockElectronShellOpenExternal).toHaveBeenCalledTimes(0);

        const menuItemClickFn = getMenuItemClickFn(
          getSubMenuItemByLabel({
            menu: helpMenu,
            label: 'Security Policy',
          })
        );

        menuItemClickFn();

        await vi.runAllTimersAsync();

        expect(mockElectronShellOpenExternal).toHaveBeenCalledTimes(1);
        expect(mockElectronShellOpenExternal).toHaveBeenCalledWith(
          PHOENIX_SECURITY_URL
        );
      });

      it('Help Menu > Play.net', async () => {
        expect(mockElectronShellOpenExternal).toHaveBeenCalledTimes(0);

        const menuItemClickFn = getMenuItemClickFn(
          getSubMenuItemByLabel({
            menu: helpMenu,
            label: 'Play.net',
          })
        );

        menuItemClickFn();

        await vi.runAllTimersAsync();

        expect(mockElectronShellOpenExternal).toHaveBeenCalledTimes(1);
        expect(mockElectronShellOpenExternal).toHaveBeenCalledWith(
          PLAY_NET_URL
        );
      });

      it('Help Menu > Elanthipedia', async () => {
        expect(mockElectronShellOpenExternal).toHaveBeenCalledTimes(0);

        const menuItemClickFn = getMenuItemClickFn(
          getSubMenuItemByLabel({
            menu: helpMenu,
            label: 'Elanthipedia',
          })
        );

        menuItemClickFn();

        await vi.runAllTimersAsync();

        expect(mockElectronShellOpenExternal).toHaveBeenCalledTimes(1);
        expect(mockElectronShellOpenExternal).toHaveBeenCalledWith(
          ELANTHIPEDIA_URL
        );
      });
    });
  });

  describe('platform: linux', () => {
    beforeEach(() => {
      processPlatformSpy.mockReturnValue('linux');
    });

    describe('#initializeMenu', () => {
      it('initializes the application menu', async () => {
        initializeMenu(mockBrowserWindow);

        expect(mockElectronMenuBuildFromTemplate).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              label: 'File',
              submenu: expect.arrayContaining([
                expect.objectContaining({
                  label: 'Open Logs Folder',
                }),
              ]),
            }),

            expect.objectContaining({
              label: '&View',
              submenu: expect.arrayContaining([
                expect.objectContaining({
                  label: '&Reload',
                  role: 'reload',
                  accelerator: 'Ctrl+R',
                }),
                expect.objectContaining({
                  type: 'separator',
                }),
                expect.objectContaining({
                  label: 'Toggle &Full Screen',
                  accelerator: 'F11',
                }),
                expect.objectContaining({
                  type: 'separator',
                }),
                expect.objectContaining({
                  label: 'Reset &Zoom',
                  accelerator: 'Ctrl+0',
                }),
                expect.objectContaining({
                  label: 'Zoom &In',
                  accelerator: 'Ctrl+=',
                }),
                expect.objectContaining({
                  label: 'Zoom &Out',
                  accelerator: 'Ctrl+-',
                }),
              ]),
            }),

            expect.objectContaining({
              label: '&Window',
              submenu: expect.arrayContaining([
                expect.objectContaining({
                  label: '&Close',
                  role: 'close',
                  accelerator: 'Ctrl+W',
                }),
                expect.objectContaining({
                  label: '',
                  type: process.platform === 'linux' ? 'normal' : 'separator',
                  visible: false,
                }),
              ]),
            }),

            expect.objectContaining({
              label: 'Help',
              submenu: expect.arrayContaining([
                expect.objectContaining({
                  label: 'Documentation',
                }),
                expect.objectContaining({
                  label: 'Release Notes',
                }),
                expect.objectContaining({
                  label: 'Submit Feedback',
                }),
                expect.objectContaining({
                  type: 'separator',
                }),
                expect.objectContaining({
                  label: 'View License',
                }),
                expect.objectContaining({
                  label: 'Privacy Policy',
                }),
                expect.objectContaining({
                  label: 'Security Policy',
                }),
                expect.objectContaining({
                  type: 'separator',
                }),
                expect.objectContaining({
                  label: 'Play.net',
                }),
                expect.objectContaining({
                  label: 'Elanthipedia',
                }),
                expect.objectContaining({
                  type: 'separator',
                }),
                expect.objectContaining({
                  label: 'About test-app-name',
                  role: 'about',
                }),
              ]),
            }),
          ])
        );

        expect(mockElectronSetApplicationMenu).toHaveBeenCalledTimes(1);

        expect(
          mockZoomFactorModule.loadZoomFactorPreference
        ).toHaveBeenCalledTimes(1);

        expect(
          mockConfirmBeforeCloseModule.loadConfirmBeforeClosePreference
        ).toHaveBeenCalledTimes(1);
      });
    });

    describe('#menuItemClick', () => {
      let menus: Array<Electron.MenuItemConstructorOptions>;
      let fileMenu: Electron.MenuItemConstructorOptions;
      let viewMenu: Electron.MenuItemConstructorOptions;
      // let windowMenu: Electron.MenuItemConstructorOptions;
      let helpMenu: Electron.MenuItemConstructorOptions;

      beforeEach(() => {
        initializeMenu(mockBrowserWindow);

        menus = mockElectronMenuBuildFromTemplate.mock.calls[0][0];
        fileMenu = menus[0] as Electron.MenuItemConstructorOptions;
        viewMenu = menus[1] as Electron.MenuItemConstructorOptions;
        // windowMenu = menus[2] as Electron.MenuItemConstructorOptions;
        helpMenu = menus[3] as Electron.MenuItemConstructorOptions;
      });

      it('File Menu > Open Logs Folder', async () => {
        expect(mockElectronShellOpenPath).toHaveBeenCalledTimes(0);

        const menuItemClickFn = getMenuItemClickFn(
          getSubMenuItemByLabel({
            menu: fileMenu,
            label: 'Open Logs Folder',
          })
        );

        menuItemClickFn();

        await vi.runAllTimersAsync();

        expect(mockElectronShellOpenPath).toHaveBeenCalledTimes(1);
        expect(mockElectronShellOpenPath).toHaveBeenCalledWith('/path/to/logs');
      });

      it('View Menu > Toggle Full Screen', async () => {
        expect(mockBrowserWindow.isFullScreen).toHaveBeenCalledTimes(0);
        expect(mockBrowserWindow.setFullScreen).toHaveBeenCalledTimes(0);
        expect(mockBrowserWindow.setMenuBarVisibility).toHaveBeenCalledTimes(0);

        const menuItemClickFn = getMenuItemClickFn(
          getSubMenuItemByLabel({
            menu: viewMenu,
            label: 'Toggle &Full Screen',
          })
        );

        menuItemClickFn();

        await vi.runAllTimersAsync();

        expect(mockBrowserWindow.isFullScreen).toHaveBeenCalledTimes(1);
        expect(mockBrowserWindow.setFullScreen).toHaveBeenCalledTimes(1);
        expect(mockBrowserWindow.setMenuBarVisibility).toHaveBeenCalledTimes(1);
      });

      it('View Menu > Reset Zoom', async () => {
        expect(mockZoomFactorModule.resetZoomFactor).toHaveBeenCalledTimes(0);

        const menuItemClickFn = getMenuItemClickFn(
          getSubMenuItemByLabel({
            menu: viewMenu,
            label: 'Reset &Zoom',
          })
        );

        menuItemClickFn();

        await vi.runAllTimersAsync();

        expect(mockZoomFactorModule.resetZoomFactor).toHaveBeenCalledTimes(1);
      });

      it('View Menu > Zoom In', async () => {
        expect(mockZoomFactorModule.increaseZoomFactor).toHaveBeenCalledTimes(
          0
        );

        const menuItemClickFn = getMenuItemClickFn(
          getSubMenuItemByLabel({
            menu: viewMenu,
            label: 'Zoom &In',
          })
        );

        menuItemClickFn();

        await vi.runAllTimersAsync();

        expect(mockZoomFactorModule.increaseZoomFactor).toHaveBeenCalledTimes(
          1
        );
      });

      it('View Menu > Zoom Out', async () => {
        expect(mockZoomFactorModule.decreaseZoomFactor).toHaveBeenCalledTimes(
          0
        );

        const menuItemClickFn = getMenuItemClickFn(
          getSubMenuItemByLabel({
            menu: viewMenu,
            label: 'Zoom &Out',
          })
        );

        menuItemClickFn();

        await vi.runAllTimersAsync();

        expect(mockZoomFactorModule.decreaseZoomFactor).toHaveBeenCalledTimes(
          1
        );
      });

      it('Help Menu > Documentation', async () => {
        expect(mockElectronShellOpenExternal).toHaveBeenCalledTimes(0);

        const menuItemClickFn = getMenuItemClickFn(
          getSubMenuItemByLabel({
            menu: helpMenu,
            label: 'Documentation',
          })
        );

        menuItemClickFn();

        await vi.runAllTimersAsync();

        expect(mockElectronShellOpenExternal).toHaveBeenCalledTimes(1);
        expect(mockElectronShellOpenExternal).toHaveBeenCalledWith(
          PHOENIX_DOCS_URL
        );
      });

      it('Help Menu > Release Notes', async () => {
        expect(mockElectronShellOpenExternal).toHaveBeenCalledTimes(0);

        const menuItemClickFn = getMenuItemClickFn(
          getSubMenuItemByLabel({
            menu: helpMenu,
            label: 'Release Notes',
          })
        );

        menuItemClickFn();

        await vi.runAllTimersAsync();

        expect(mockElectronShellOpenExternal).toHaveBeenCalledTimes(1);
        expect(mockElectronShellOpenExternal).toHaveBeenCalledWith(
          PHOENIX_RELEASES_URL
        );
      });

      it('Help Menu > Submit Feedback', async () => {
        expect(mockElectronShellOpenExternal).toHaveBeenCalledTimes(0);

        const menuItemClickFn = getMenuItemClickFn(
          getSubMenuItemByLabel({
            menu: helpMenu,
            label: 'Submit Feedback',
          })
        );

        menuItemClickFn();

        await vi.runAllTimersAsync();

        expect(mockElectronShellOpenExternal).toHaveBeenCalledTimes(1);
        expect(mockElectronShellOpenExternal).toHaveBeenCalledWith(
          PHOENIX_ISSUES_URL
        );
      });

      it('Help Menu > View License', async () => {
        expect(mockElectronShellOpenExternal).toHaveBeenCalledTimes(0);

        const menuItemClickFn = getMenuItemClickFn(
          getSubMenuItemByLabel({
            menu: helpMenu,
            label: 'View License',
          })
        );

        menuItemClickFn();

        await vi.runAllTimersAsync();

        expect(mockElectronShellOpenExternal).toHaveBeenCalledTimes(1);
        expect(mockElectronShellOpenExternal).toHaveBeenCalledWith(
          PHOENIX_LICENSE_URL
        );
      });

      it('Help Menu > Privacy Policy', async () => {
        expect(mockElectronShellOpenExternal).toHaveBeenCalledTimes(0);

        const menuItemClickFn = getMenuItemClickFn(
          getSubMenuItemByLabel({
            menu: helpMenu,
            label: 'Privacy Policy',
          })
        );

        menuItemClickFn();

        await vi.runAllTimersAsync();

        expect(mockElectronShellOpenExternal).toHaveBeenCalledTimes(1);
        expect(mockElectronShellOpenExternal).toHaveBeenCalledWith(
          PHOENIX_PRIVACY_URL
        );
      });

      it('Help Menu > Security Policy', async () => {
        expect(mockElectronShellOpenExternal).toHaveBeenCalledTimes(0);

        const menuItemClickFn = getMenuItemClickFn(
          getSubMenuItemByLabel({
            menu: helpMenu,
            label: 'Security Policy',
          })
        );

        menuItemClickFn();

        await vi.runAllTimersAsync();

        expect(mockElectronShellOpenExternal).toHaveBeenCalledTimes(1);
        expect(mockElectronShellOpenExternal).toHaveBeenCalledWith(
          PHOENIX_SECURITY_URL
        );
      });

      it('Help Menu > Play.net', async () => {
        expect(mockElectronShellOpenExternal).toHaveBeenCalledTimes(0);

        const menuItemClickFn = getMenuItemClickFn(
          getSubMenuItemByLabel({
            menu: helpMenu,
            label: 'Play.net',
          })
        );

        menuItemClickFn();

        await vi.runAllTimersAsync();

        expect(mockElectronShellOpenExternal).toHaveBeenCalledTimes(1);
        expect(mockElectronShellOpenExternal).toHaveBeenCalledWith(
          PLAY_NET_URL
        );
      });

      it('Help Menu > Elanthipedia', async () => {
        expect(mockElectronShellOpenExternal).toHaveBeenCalledTimes(0);

        const menuItemClickFn = getMenuItemClickFn(
          getSubMenuItemByLabel({
            menu: helpMenu,
            label: 'Elanthipedia',
          })
        );

        menuItemClickFn();

        await vi.runAllTimersAsync();

        expect(mockElectronShellOpenExternal).toHaveBeenCalledTimes(1);
        expect(mockElectronShellOpenExternal).toHaveBeenCalledWith(
          ELANTHIPEDIA_URL
        );
      });
    });
  });
});
