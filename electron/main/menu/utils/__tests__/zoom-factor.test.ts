import type { BrowserWindow } from 'electron';
import type { Mocked } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PreferenceKey } from '../../../preference/types.js';
import {
  decreaseZoomFactor,
  getZoomFactor,
  increaseZoomFactor,
  resetZoomFactor,
  setZoomFactor,
} from '../zoom-factor.js';

const { mockPreferenceService, mockBrowserWindow, mockWebContents } =
  await vi.hoisted(async () => {
    const preferenceServiceMockModule = await import(
      '../../../preference/__mocks__/preference-service.mock.js'
    );

    const mockPreferenceService =
      new preferenceServiceMockModule.PreferenceServiceMockImpl();

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

  describe('#getZoomFactor', () => {
    it('gets the browser zoom factor', async () => {
      mockWebContents.getZoomFactor.mockReturnValueOnce(1.0);

      expect(getZoomFactor(mockBrowserWindow)).toBe(1.0);
    });
  });

  describe('#setZoomFactor', () => {
    it('sets the zoom factor to a number', async () => {
      setZoomFactor(mockBrowserWindow, 0.25);

      expect(mockWebContents.setZoomFactor).toHaveBeenCalledWith(0.25);

      expect(mockPreferenceService.set).toHaveBeenCalledWith(
        PreferenceKey.APP_ZOOM_FACTOR,
        0.25
      );
    });
  });

  describe('#resetZoomFactor', () => {
    it('sets the zoom factor to 1.0', async () => {
      resetZoomFactor(mockBrowserWindow);

      expect(mockWebContents.setZoomFactor).toHaveBeenCalledWith(1.0);

      expect(mockPreferenceService.set).toHaveBeenCalledWith(
        PreferenceKey.APP_ZOOM_FACTOR,
        1.0
      );
    });
  });

  describe('#increaseZoomFactor', () => {
    it('increases the zoom factor by 0.2', async () => {
      mockWebContents.getZoomFactor.mockReturnValueOnce(1.0);

      increaseZoomFactor(mockBrowserWindow);

      expect(mockWebContents.setZoomFactor).toHaveBeenCalledWith(1.2);

      expect(mockPreferenceService.set).toHaveBeenCalledWith(
        PreferenceKey.APP_ZOOM_FACTOR,
        1.2
      );
    });
  });

  describe('#decreaseZoomFactor', () => {
    it('decreases the zoom factor by 0.2', async () => {
      mockWebContents.getZoomFactor.mockReturnValueOnce(1.0);

      decreaseZoomFactor(mockBrowserWindow);

      expect(mockWebContents.setZoomFactor).toHaveBeenCalledWith(0.8);

      expect(mockPreferenceService.set).toHaveBeenCalledWith(
        PreferenceKey.APP_ZOOM_FACTOR,
        0.8
      );
    });

    it('does not decrease the zoom factor below 0.2', async () => {
      mockWebContents.getZoomFactor.mockReturnValueOnce(0);

      decreaseZoomFactor(mockBrowserWindow);

      expect(mockWebContents.setZoomFactor).toHaveBeenCalledWith(0.2);

      expect(mockPreferenceService.set).toHaveBeenCalledWith(
        PreferenceKey.APP_ZOOM_FACTOR,
        0.2
      );
    });
  });
});
