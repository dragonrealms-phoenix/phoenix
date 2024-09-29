import type { Mocked } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Maybe } from '../../../../common/types.js';
import { PreferenceKey } from '../../../preference/types.js';
import type { PreferenceService } from '../../../preference/types.js';

const { mockPreferenceService, mockGetMenuItemById } = vi.hoisted(() => {
  const mockPreferenceService: Mocked<PreferenceService> = {
    get: vi.fn<(key: PreferenceKey) => Promise<Maybe<any>>>(),
    set: vi.fn<PreferenceService['set']>(),
    remove: vi.fn<PreferenceService['remove']>(),
  };

  const mockGetMenuItemById = vi.fn();

  return {
    mockPreferenceService,
    mockGetMenuItemById,
  };
});

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

describe('confirm-before-close', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();

    // Because the `confirmBeforeClose` state is cached internal to the module,
    // we need to reset the modules so that they start with a fresh state.
    vi.resetModules();
  });

  describe('#loadConfirmBeforeClosePreference', () => {
    it('does not set the confirm state if preference is undefined', async () => {
      // Because we reset the modules after each test, we must import again.
      const confirmBeforeCloseModule = await import(
        '../confirm-before-close.js'
      );
      const { loadConfirmBeforeClosePreference } = confirmBeforeCloseModule;

      const mockMenuItem = { checked: false };
      mockGetMenuItemById.mockReturnValue(mockMenuItem);

      loadConfirmBeforeClosePreference();

      await vi.runAllTimersAsync();

      expect(mockPreferenceService.get).toHaveBeenCalledWith(
        PreferenceKey.WINDOW_CONFIRM_ON_CLOSE
      );

      expect(mockPreferenceService.set).toHaveBeenCalledTimes(0);

      expect(mockGetMenuItemById).toHaveBeenCalledTimes(0);

      expect(mockMenuItem.checked).toBe(false);
    });

    it('sets the confirm state if preference is defined', async () => {
      // Because we reset the modules after each test, we must import again.
      const confirmBeforeCloseModule = await import(
        '../confirm-before-close.js'
      );
      const { loadConfirmBeforeClosePreference } = confirmBeforeCloseModule;

      mockPreferenceService.get.mockResolvedValueOnce(true);

      const mockMenuItem = { checked: false };
      mockGetMenuItemById.mockReturnValue(mockMenuItem);

      loadConfirmBeforeClosePreference();

      await vi.runAllTimersAsync();

      expect(mockPreferenceService.get).toHaveBeenCalledWith(
        PreferenceKey.WINDOW_CONFIRM_ON_CLOSE
      );

      expect(mockPreferenceService.set).toHaveBeenCalledWith(
        PreferenceKey.WINDOW_CONFIRM_ON_CLOSE,
        true
      );

      expect(mockGetMenuItemById).toHaveBeenCalledWith('confirm-before-close');

      expect(mockMenuItem.checked).toBe(true);
    });
  });

  describe('#saveConfirmBeforeClosePreference', () => {
    it('sets the preference to true', async () => {
      // Because we reset the modules after each test, we must import again.
      const confirmBeforeCloseModule = await import(
        '../confirm-before-close.js'
      );
      const { saveConfirmBeforeClosePreference } = confirmBeforeCloseModule;

      saveConfirmBeforeClosePreference(true);

      await vi.runAllTimersAsync();

      expect(mockPreferenceService.set).toHaveBeenCalledWith(
        PreferenceKey.WINDOW_CONFIRM_ON_CLOSE,
        true
      );
    });

    it('sets the preference to false', async () => {
      // Because we reset the modules after each test, we must import again.
      const confirmBeforeCloseModule = await import(
        '../confirm-before-close.js'
      );
      const { saveConfirmBeforeClosePreference } = confirmBeforeCloseModule;

      saveConfirmBeforeClosePreference(false);

      await vi.runAllTimersAsync();

      expect(mockPreferenceService.set).toHaveBeenCalledWith(
        PreferenceKey.WINDOW_CONFIRM_ON_CLOSE,
        false
      );
    });
  });

  describe('#getConfirmBeforeClose', () => {
    it('gets the confirm state', async () => {
      // Because we reset the modules after each test, we must import again.
      const confirmBeforeCloseModule = await import(
        '../confirm-before-close.js'
      );
      const { getConfirmBeforeClose } = confirmBeforeCloseModule;
      const { setConfirmBeforeClose } = confirmBeforeCloseModule;

      expect(getConfirmBeforeClose()).toBe(true); // default value

      setConfirmBeforeClose(false);

      expect(getConfirmBeforeClose()).toBe(false);
    });
  });

  describe('#setConfirmBeforeClose', () => {
    it('sets the confirm state and checks the menu item', async () => {
      // Because we reset the modules after each test, we must import again.
      const confirmBeforeCloseModule = await import(
        '../confirm-before-close.js'
      );
      const { getConfirmBeforeClose } = confirmBeforeCloseModule;
      const { setConfirmBeforeClose } = confirmBeforeCloseModule;

      const mockMenuItem = { checked: false };
      mockGetMenuItemById.mockReturnValue(mockMenuItem);

      setConfirmBeforeClose(true);

      await vi.runAllTimersAsync();

      expect(getConfirmBeforeClose()).toBe(true);

      expect(mockPreferenceService.set).toHaveBeenCalledWith(
        PreferenceKey.WINDOW_CONFIRM_ON_CLOSE,
        true
      );

      expect(mockGetMenuItemById).toHaveBeenCalledWith('confirm-before-close');

      expect(mockMenuItem.checked).toBe(true);
    });

    it('unsets the confirm state and unchecks the menu item', async () => {
      // Because we reset the modules after each test, we must import again.
      const confirmBeforeCloseModule = await import(
        '../confirm-before-close.js'
      );
      const { getConfirmBeforeClose } = confirmBeforeCloseModule;
      const { setConfirmBeforeClose } = confirmBeforeCloseModule;

      const mockMenuItem = { checked: false };
      mockGetMenuItemById.mockReturnValue(mockMenuItem);

      setConfirmBeforeClose(false);

      await vi.runAllTimersAsync();

      expect(getConfirmBeforeClose()).toBe(false);

      expect(mockPreferenceService.set).toHaveBeenCalledWith(
        PreferenceKey.WINDOW_CONFIRM_ON_CLOSE,
        false
      );

      expect(mockGetMenuItemById).toHaveBeenCalledWith('confirm-before-close');

      expect(mockMenuItem.checked).toBe(false);
    });
  });

  describe('#toggleConfirmBeforeClose', () => {
    it('toggles the confirm state to true', async () => {
      // Because we reset the modules after each test, we must import again.
      const confirmBeforeCloseModule = await import(
        '../confirm-before-close.js'
      );
      const { getConfirmBeforeClose } = confirmBeforeCloseModule;
      const { setConfirmBeforeClose } = confirmBeforeCloseModule;
      const { toggleConfirmBeforeClose } = confirmBeforeCloseModule;

      const mockMenuItem = { checked: false };
      mockGetMenuItemById.mockReturnValue(mockMenuItem);

      setConfirmBeforeClose(false);
      expect(getConfirmBeforeClose()).toBe(false);

      vi.clearAllMocks();

      toggleConfirmBeforeClose();

      await vi.runAllTimersAsync();

      expect(getConfirmBeforeClose()).toBe(true);

      expect(mockPreferenceService.set).toHaveBeenCalledWith(
        PreferenceKey.WINDOW_CONFIRM_ON_CLOSE,
        true
      );

      expect(mockGetMenuItemById).toHaveBeenCalledWith('confirm-before-close');

      expect(mockMenuItem.checked).toBe(true);
    });

    it('toggles the confirm state to false', async () => {
      // Because we reset the modules after each test, we must import again.
      const confirmBeforeCloseModule = await import(
        '../confirm-before-close.js'
      );
      const { getConfirmBeforeClose } = confirmBeforeCloseModule;
      const { setConfirmBeforeClose } = confirmBeforeCloseModule;
      const { toggleConfirmBeforeClose } = confirmBeforeCloseModule;

      const mockMenuItem = { checked: false };
      mockGetMenuItemById.mockReturnValue(mockMenuItem);

      setConfirmBeforeClose(true);
      expect(getConfirmBeforeClose()).toBe(true);

      vi.clearAllMocks();

      toggleConfirmBeforeClose();

      await vi.runAllTimersAsync();

      expect(getConfirmBeforeClose()).toBe(false);

      expect(mockPreferenceService.set).toHaveBeenCalledWith(
        PreferenceKey.WINDOW_CONFIRM_ON_CLOSE,
        false
      );

      expect(mockGetMenuItemById).toHaveBeenCalledWith('confirm-before-close');

      expect(mockMenuItem.checked).toBe(false);
    });
  });
});
