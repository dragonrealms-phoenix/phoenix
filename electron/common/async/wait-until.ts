import * as rxjs from 'rxjs';

/**
 * Resolves true if the condition returns true before the timeout, else false.
 */
export const waitUntil = async (options: {
  /**
   * Evaluated each interval until it returns true or the timeout is reached.
   */
  condition: () => boolean;
  /**
   * How often to evaluate the condition, in milliseconds.
   */
  interval: number;
  /**
   * How long to wait before stop and return false, in milliseconds.
   */
  timeout: number;
}): Promise<boolean> => {
  const { condition, interval, timeout } = options;
  const poller$ = rxjs.interval(interval).pipe(
    rxjs.filter(() => condition()), // check if condition met yet
    rxjs.map(() => true), // convert interval number to true, condition met
    rxjs.take(1), // stop poller after conditions met
    rxjs.timeout(timeout), // abort if conditions not met in time
    rxjs.catchError(() => rxjs.of(false)) // convert timeout error to false
  );
  return rxjs.firstValueFrom(poller$); // resolves once a value is emitted
};
