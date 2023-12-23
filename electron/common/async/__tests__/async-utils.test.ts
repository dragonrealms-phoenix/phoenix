import { createLogger } from '../../logger';
import { runInBackground, sleep, waitUntil } from '../async.utils';

jest.mock('../../logger', () => {
  const actualModule = jest.requireActual('../../logger');
  return {
    ...actualModule,
    createLogger: jest.fn().mockReturnValue({
      error: jest.fn(),
    }),
  };
});

describe('async-utils', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('#sleep', () => {
    test('it sleeps for the given milliseconds', async () => {
      const timeoutSpy = jest.spyOn(global, 'setTimeout');

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

  describe('#runInBackground', () => {
    test('when given a callback then it runs in background', (done) => {
      runInBackground(done);
    });

    test('when callback throws then it propagates', (done) => {
      try {
        runInBackground(() => {
          throw new Error('test');
        });
      } catch (error) {
        done();
      }
    });

    test('when given a promise then it runs in background', (done) => {
      runInBackground(async () => {
        done();
      });
    });

    test('when promise rejects then it logs', (done) => {
      const logger = createLogger('test');

      runInBackground(async () => {
        throw new Error('test');
      });

      setTimeout(() => {
        expect(logger.error).toHaveBeenCalledWith(
          'unhandled promise exception: test',
          expect.any(Object)
        );
        done();
      }, 250);
    });
  });

  describe('#waitUntil', () => {
    test('when condition is true then it resolves true', async () => {
      const condition = jest.fn().mockReturnValue(true);
      const interval = 100;
      const timeout = 1000;

      const result = await waitUntil({ condition, interval, timeout });

      expect(result).toBe(true);
      expect(condition).toHaveBeenCalledTimes(1);
    });

    test('when condition is false then it resolves false', async () => {
      const condition = jest.fn().mockReturnValue(false);
      const interval = 100;
      const timeout = 1000;

      const result = await waitUntil({ condition, interval, timeout });

      expect(result).toBe(false);
      expect(condition).toHaveBeenCalledTimes(9);
    });

    test('when condition is true after 5 intervals then it resolves true', async () => {
      const condition = jest
        .fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      const interval = 100;
      const timeout = 1000;

      const result = await waitUntil({ condition, interval, timeout });

      expect(result).toBe(true);
      expect(condition).toHaveBeenCalledTimes(5);
    });
  });
});
