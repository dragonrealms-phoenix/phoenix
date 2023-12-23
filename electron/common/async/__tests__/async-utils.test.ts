import { createLogger } from '../../logger';
import { runInBackground, sleep } from '../async.utils';

jest.mock('../../logger/logger.utils', () => {
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

      expect(timeoutSpy).toBeCalledTimes(1);
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
});
