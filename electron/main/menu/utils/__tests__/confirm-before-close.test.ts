import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PreferenceKey } from '../../../preference/types.js';
import {
  getConfirmBeforeClose,
  setConfirmBeforeClose,
  toggleConfirmBeforeClose,
} from '../confirm-before-close.js';

const { mockPreferenceService, mockGetMenuItemById } = await vi.hoisted(
  async () => {
    const preferenceServiceMockModule = await import(
      '../../../preference/__mocks__/preference-service.mock.js'
    );

    const mockPreferenceService =
      new preferenceServiceMockModule.PreferenceServiceMockImpl();

    const mockGetMenuItemById = vi.fn();

    return {
      mockPreferenceService,
      mockGetMenuItemById,
    };
  }
);

vi.mock('../../../preference/preference.instance.js', () => {
  return {
    Preferences: mockPreferenceService,
  };
});

vi.mock('../get-menu-item-by-id.js', () => {
  return {
    getMenuItemById: mockGetMenuItemById,
  };
});

vi.mock('../../../logger/logger.factory.ts');

describe('confirm-before-close', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#getConfirmBeforeClose', () => {
    it('gets true when the preference is true', async () => {
      mockPreferenceService.get.mockReturnValue(true);

      expect(getConfirmBeforeClose()).toBe(true);
    });

    it('gets false when the preference is false', async () => {
      mockPreferenceService.get.mockReturnValue(false);

      expect(getConfirmBeforeClose()).toBe(false);
    });
  });

  describe('#setConfirmBeforeClose', () => {
    it('sets the confirm state and checks the menu item', async () => {
      const mockMenuItem = { checked: false };
      mockGetMenuItemById.mockReturnValue(mockMenuItem);

      setConfirmBeforeClose(true);

      expect(mockPreferenceService.set).toHaveBeenCalledWith(
        PreferenceKey.APP_CONFIRM_CLOSE,
        true
      );

      expect(mockGetMenuItemById).toHaveBeenCalledWith('confirm-before-close');

      expect(mockMenuItem.checked).toBe(true);
    });

    it('unsets the confirm state and unchecks the menu item', async () => {
      const mockMenuItem = { checked: true };
      mockGetMenuItemById.mockReturnValue(mockMenuItem);

      setConfirmBeforeClose(false);

      expect(mockPreferenceService.set).toHaveBeenCalledWith(
        PreferenceKey.APP_CONFIRM_CLOSE,
        false
      );

      expect(mockGetMenuItemById).toHaveBeenCalledWith('confirm-before-close');

      expect(mockMenuItem.checked).toBe(false);
    });
  });

  describe('#toggleConfirmBeforeClose', () => {
    it('toggles the confirm state to true', async () => {
      const mockMenuItem = { checked: false };
      mockGetMenuItemById.mockReturnValue(mockMenuItem);

      mockPreferenceService.get.mockReturnValueOnce(false);

      toggleConfirmBeforeClose();

      expect(mockPreferenceService.set).toHaveBeenCalledWith(
        PreferenceKey.APP_CONFIRM_CLOSE,
        true
      );

      expect(mockGetMenuItemById).toHaveBeenCalledWith('confirm-before-close');

      expect(mockMenuItem.checked).toBe(true);
    });

    it('toggles the confirm state to false', async () => {
      const mockMenuItem = { checked: true };
      mockGetMenuItemById.mockReturnValue(mockMenuItem);

      mockPreferenceService.get.mockReturnValueOnce(true);

      toggleConfirmBeforeClose();

      expect(mockPreferenceService.set).toHaveBeenCalledWith(
        PreferenceKey.APP_CONFIRM_CLOSE,
        false
      );

      expect(mockGetMenuItemById).toHaveBeenCalledWith('confirm-before-close');

      expect(mockMenuItem.checked).toBe(false);
    });
  });
});
