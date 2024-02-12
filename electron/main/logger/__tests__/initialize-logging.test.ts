import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearElectronLoggerMockProps,
  mockElectronLogMain,
} from '../../../common/__mocks__/electron-log.mock.js';
import { initializeLogging } from '../initialize-logging.js';

const { mockCommonInitializeLogging } = vi.hoisted(() => {
  const mockCommonInitializeLogging = vi.fn();

  return {
    mockCommonInitializeLogging,
  };
});

vi.mock('../../../common/logger/initialize-logging.js', () => {
  return {
    initializeLogging: mockCommonInitializeLogging,
  };
});

describe('initialize-logging', () => {
  beforeEach(async () => {
    clearElectronLoggerMockProps(mockElectronLogMain);
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#initializeLogging', () => {
    it('initializes the main electron logger', async () => {
      initializeLogging();

      expect(mockCommonInitializeLogging).toHaveBeenCalledWith(
        mockElectronLogMain
      );

      expect(mockElectronLogMain.initialize).toHaveBeenCalledWith({
        preload: true,
      });

      expect(mockElectronLogMain.errorHandler.startCatching).toHaveBeenCalled();
    });
  });
});
