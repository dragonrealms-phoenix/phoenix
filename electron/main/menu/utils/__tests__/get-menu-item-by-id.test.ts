import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getMenuItemById } from '../get-menu-item-by-id.js';

const { mockElectronGetApplicationMenu, mockElectronGetMenuItemById } =
  vi.hoisted(() => {
    const mockElectronGetApplicationMenu = vi.fn();
    const mockElectronGetMenuItemById = vi.fn();

    return {
      mockElectronGetApplicationMenu,
      mockElectronGetMenuItemById,
    };
  });

vi.mock('electron', () => {
  return {
    Menu: {
      getApplicationMenu: mockElectronGetApplicationMenu,
    },
  };
});

describe('get-menu-item-by-id', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('returns undefined if menu is not available', async () => {
    mockElectronGetApplicationMenu.mockReturnValueOnce(undefined);

    const menuItemId = getMenuItemById('test');

    expect(menuItemId).toEqual(undefined);
  });

  it('returns undefined if menu item is not available', async () => {
    mockElectronGetMenuItemById.mockReturnValueOnce(undefined);

    mockElectronGetApplicationMenu.mockReturnValueOnce({
      getMenuItemById: mockElectronGetMenuItemById,
    });

    const menuItemId = getMenuItemById('test');

    expect(menuItemId).toEqual(undefined);
  });

  it('returns menu item if menu item is available', async () => {
    const mockMenuItem: Partial<Electron.MenuItem> = {
      id: 'test-menu-item-id',
    };

    mockElectronGetMenuItemById.mockReturnValueOnce(mockMenuItem);

    mockElectronGetApplicationMenu.mockReturnValueOnce({
      getMenuItemById: mockElectronGetMenuItemById,
    });

    const menuItemId = getMenuItemById('test-menu-item-id');

    expect(menuItemId).toEqual(mockMenuItem);
  });
});
