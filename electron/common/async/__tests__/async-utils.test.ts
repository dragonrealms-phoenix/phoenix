import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sleep, waitUntil } from '../async.utils.js';

describe('async-utils', () => {
  describe('#sleep', () => {
    it('it sleeps for the given milliseconds', async () => {
      const timeoutSpy = vi.spyOn(global, 'setTimeout');

      const sleepMillis = 100;
      const varianceMillis = sleepMillis * 0.5;

      const start = Date.now();

      await sleep(100);

      const end = Date.now();

      expect(timeoutSpy).toHaveBeenCalledTimes(1);
      expect(end - start).toBeGreaterThanOrEqual(sleepMillis - varianceMillis);
      expect(end - start).toBeLessThanOrEqual(sleepMillis + varianceMillis);
    });
  });

  describe('#waitUntil', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.clearAllMocks();
      vi.clearAllTimers();
      vi.useRealTimers();
    });

    it('resolves true when condition is true', async () => {
      const condition = vi.fn().mockReturnValueOnce(true);
      const interval = 100;
      const timeout = 1000;

      const resultAsync = waitUntil({ condition, interval, timeout });
      vi.runAllTimers();
      const result = await resultAsync;

      expect(result).toEqual(true);
      expect(condition).toHaveBeenCalledTimes(1);
    });

    it('resolves false when condition is false', async () => {
      const condition = vi.fn().mockReturnValueOnce(false);
      const interval = 100;
      const timeout = 1000;
      const iterations = Math.floor(timeout / interval);

      const resultAsync = waitUntil({ condition, interval, timeout });
      vi.runAllTimers();
      const result = await resultAsync;

      expect(result).toEqual(false);
      expect(condition).toHaveBeenCalledTimes(iterations);
    });

    it('resolves true when condition is true after 5 intervals', async () => {
      const condition = vi
        .fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      const interval = 100;
      const timeout = 1000;

      const resultAsync = waitUntil({ condition, interval, timeout });
      vi.runAllTimers();
      const result = await resultAsync;

      expect(result).toEqual(true);
      expect(condition).toHaveBeenCalledTimes(5);
    });
  });
});
