import type { BrowserWindow } from 'electron';
import { runInBackground } from '../../async/run-in-background.js';
import { Preferences } from '../../preference/preference.instance.js';
import { PreferenceKey } from '../../preference/types.js';

export const loadZoomFactorPreference = (window: BrowserWindow): void => {
  runInBackground(async () => {
    const zoomFactor = await Preferences.get(PreferenceKey.WINDOW_ZOOM_FACTOR);
    if (zoomFactor !== undefined) {
      setZoomFactor(window, zoomFactor);
    }
  });
};

export const saveZoomFactorPreference = (zoomFactor: number): void => {
  runInBackground(async () => {
    await Preferences.set(PreferenceKey.WINDOW_ZOOM_FACTOR, zoomFactor);
  });
};

/**
 * Gets the current zoom factor of the window.
 * Returns a value between 0 < zoomFactor <= 1
 */
export const getZoomFactor = (window: BrowserWindow): number => {
  return window.webContents.getZoomFactor();
};

/**
 * Set the zoom factor of the window.
 * Provide a value between 0 < zoomFactor <= 1
 */
export const setZoomFactor = (
  window: BrowserWindow,
  zoomFactor: number
): void => {
  window.webContents.setZoomFactor(zoomFactor);
  saveZoomFactorPreference(zoomFactor);
};

export const resetZoomFactor = (window: BrowserWindow): void => {
  const zoomFactor = 1;
  setZoomFactor(window, zoomFactor);
};

export const increaseZoomFactor = (window: BrowserWindow): void => {
  const zoomFactor = getZoomFactor(window) + 0.2;
  setZoomFactor(window, zoomFactor);
};

export const decreaseZoomFactor = (window: BrowserWindow): void => {
  // Set lower bound to avoid error when zoom factor is too small.
  const zoomFactor = Math.max(0.2, getZoomFactor(window) - 0.2);
  setZoomFactor(window, zoomFactor);
};
