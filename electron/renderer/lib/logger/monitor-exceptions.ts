import electronRendererLogger from 'electron-log/renderer.js';

/**
 * Catch and log unhandled exceptions, such as promise rejections.
 * Requires the `window` object, so can only run client-side.
 */
export const startMonitoringUnhandledExceptions = (): void => {
  electronRendererLogger.errorHandler.startCatching();
};

export const stopMonitoringUnhandledExceptions = (): void => {
  electronRendererLogger.errorHandler.stopCatching();
};
