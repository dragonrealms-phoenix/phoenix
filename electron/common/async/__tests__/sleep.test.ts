import { describe, expect, it, vi } from 'vitest';
import { sleep } from '../sleep.js';

describe('sleep', () => {
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
