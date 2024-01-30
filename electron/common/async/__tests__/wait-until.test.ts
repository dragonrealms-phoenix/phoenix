import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { waitUntil } from '../wait-until.js';

describe('wait-until', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('resolves true when condition is true', async () => {
    const condition = vi.fn().mockReturnValue(true);
    const interval = 100;
    const timeout = 1000;

    const resultAsync = waitUntil({ condition, interval, timeout });
    vi.runAllTimers();
    const result = await resultAsync;

    expect(result).toEqual(true);
    expect(condition).toHaveBeenCalledTimes(1);
  });

  it('resolves false when condition is false', async () => {
    const condition = vi.fn().mockReturnValue(false);
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
