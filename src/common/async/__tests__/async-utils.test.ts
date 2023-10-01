import { sleep } from '../async.utils';

describe('async-utils', () => {
  describe('#sleep', () => {
    it('should resolve after 1000ms', async () => {
      jest.useFakeTimers();

      let didSleep = false;

      const fn = jest.fn().mockImplementation(async () => {
        await sleep(1000);
        didSleep = true;
      });

      expect(didSleep).toBe(false); // sanity check

      fn(); // kick off promise in background

      expect(didSleep).toBe(false); // assert that sleep function hasn't resolved yet

      jest.advanceTimersByTime(1000); // advance time for sleep function
      await jest.runAllTimersAsync(); // yield to let sleep function resolve

      expect(didSleep).toBe(true); // assert that sleep function resolved
    });
  });
});
