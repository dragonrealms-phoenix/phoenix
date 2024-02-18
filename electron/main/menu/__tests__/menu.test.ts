import type { BrowserWindow } from 'electron';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
  const mockBrowserWindow = {} as unknown as BrowserWindow;

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
    },
    shell: {
      openPath: mockElectronShellOpenPath,
      openExternal: mockElectronShellOpenExternal,
    },
  };
});

describe('menu', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#initializeMenu', () => {
    describe('platform: darwin', () => {
      beforeEach(() => {
        vi.spyOn(process, 'platform', 'get').mockReturnValue('darwin');
      });

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

    describe('platform: linux', () => {
      beforeEach(() => {
        vi.spyOn(process, 'platform', 'get').mockReturnValue('linux');
      });

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
  });
});
