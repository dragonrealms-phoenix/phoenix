import type { BrowserWindow } from 'electron';
import type { Mocked } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Maybe } from '../../../../common/types.js';
import { PreferenceKey } from '../../../preference/types.js';
import type { PreferenceService } from '../../../preference/types.js';
import {
  decreaseZoomFactor,
  getZoomFactor,
  increaseZoomFactor,
  loadZoomFactorPreference,
  resetZoomFactor,
  saveZoomFactorPreference,
  setZoomFactor,
} from '../zoom-factor.js';

const { mockPreferenceService, mockBrowserWindow, mockWebContents } =
  vi.hoisted(() => {
    const mockPreferenceService: Mocked<PreferenceService> = {
      get: vi.fn<(key: PreferenceKey) => Promise<Maybe<any>>>(),
      set: vi.fn<PreferenceService['set']>(),
      remove: vi.fn<PreferenceService['remove']>(),
    };

    const mockWebContents = {
      getZoomFactor: vi.fn(),
      setZoomFactor: vi.fn(),
    } as unknown as Mocked<BrowserWindow['webContents']>;

    const mockBrowserWindow = {
      webContents: mockWebContents,
    } as unknown as BrowserWindow;

    return {
      mockPreferenceService,
      mockBrowserWindow,
      mockWebContents,
    };
  });

vi.mock('../../../preference/preference.instance.js', () => {
  return {
    Preferences: mockPreferenceService,
  };
});

vi.mock('../../../logger/logger.factory.ts');

describe('zoom-factor', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#loadZoomFactorPreference', () => {
    it('does not set the zoom factor if preference is undefined', async () => {
      mockPreferenceService.get.mockResolvedValueOnce(undefined);

      loadZoomFactorPreference(mockBrowserWindow);

      await vi.runAllTimersAsync();

      expect(mockPreferenceService.get).toHaveBeenCalledWith(
        PreferenceKey.WINDOW_ZOOM_FACTOR
      );

      expect(mockPreferenceService.set).toHaveBeenCalledTimes(0);

      expect(mockWebContents.setZoomFactor).toHaveBeenCalledTimes(0);
    });

    it('sets the zoom factor if preference is defined', async () => {
      mockPreferenceService.get.mockResolvedValueOnce(0.5);

      loadZoomFactorPreference(mockBrowserWindow);

      await vi.runAllTimersAsync();

      expect(mockPreferenceService.get).toHaveBeenCalledWith(
        PreferenceKey.WINDOW_ZOOM_FACTOR
      );

      expect(mockPreferenceService.set).toHaveBeenCalledWith(
        PreferenceKey.WINDOW_ZOOM_FACTOR,
        0.5
      );

      expect(mockWebContents.setZoomFactor).toHaveBeenCalledWith(0.5);
    });
  });

  describe('#saveZoomFactorPreference', () => {
    it('sets the zoom factor preference to a number', async () => {
      saveZoomFactorPreference(0.5);

      await vi.runAllTimersAsync();

      expect(mockPreferenceService.set).toHaveBeenCalledWith(
        PreferenceKey.WINDOW_ZOOM_FACTOR,
        0.5
      );
    });
  });

  describe('#getZoomFactor', () => {
    it('gets the browser zoom factor', async () => {
      mockWebContents.getZoomFactor.mockReturnValueOnce(1.0);

      expect(getZoomFactor(mockBrowserWindow)).toBe(1.0);
    });
  });

  describe('#setZoomFactor', () => {
    it('sets the zoom factor to a number', async () => {
      setZoomFactor(mockBrowserWindow, 0.25);

      await vi.runAllTimersAsync();

      expect(mockWebContents.setZoomFactor).toHaveBeenCalledWith(0.25);

      expect(mockPreferenceService.set).toHaveBeenCalledWith(
        PreferenceKey.WINDOW_ZOOM_FACTOR,
        0.25
      );
    });
  });

  describe('#resetZoomFactor', () => {
    it('sets the zoom factor to 1.0', async () => {
      resetZoomFactor(mockBrowserWindow);

      await vi.runAllTimersAsync();

      expect(mockWebContents.setZoomFactor).toHaveBeenCalledWith(1.0);

      expect(mockPreferenceService.set).toHaveBeenCalledWith(
        PreferenceKey.WINDOW_ZOOM_FACTOR,
        1.0
      );
    });
  });

  describe('#increaseZoomFactor', () => {
    it('increases the zoom factor by 0.2', async () => {
      mockWebContents.getZoomFactor.mockReturnValueOnce(1.0);

      increaseZoomFactor(mockBrowserWindow);

      await vi.runAllTimersAsync();

      expect(mockWebContents.setZoomFactor).toHaveBeenCalledWith(1.2);

      expect(mockPreferenceService.set).toHaveBeenCalledWith(
        PreferenceKey.WINDOW_ZOOM_FACTOR,
        1.2
      );
    });
  });

  describe('#decreaseZoomFactor', () => {
    it('decreases the zoom factor by 0.2', async () => {
      mockWebContents.getZoomFactor.mockReturnValueOnce(1.0);

      decreaseZoomFactor(mockBrowserWindow);

      await vi.runAllTimersAsync();

      expect(mockWebContents.setZoomFactor).toHaveBeenCalledWith(0.8);

      expect(mockPreferenceService.set).toHaveBeenCalledWith(
        PreferenceKey.WINDOW_ZOOM_FACTOR,
        0.8
      );
    });

    it('does not decrease the zoom factor below 0.2', async () => {
      mockWebContents.getZoomFactor.mockReturnValueOnce(0);

      decreaseZoomFactor(mockBrowserWindow);

      await vi.runAllTimersAsync();

      expect(mockWebContents.setZoomFactor).toHaveBeenCalledWith(0.2);

      expect(mockPreferenceService.set).toHaveBeenCalledWith(
        PreferenceKey.WINDOW_ZOOM_FACTOR,
        0.2
      );
    });
  });
});
