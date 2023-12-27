import * as rxjs from 'rxjs';
import { createLogger } from '../logger';

const logger = createLogger('async:utils');

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * For "fire and forget" scenarios when you don't want, or can't, await
 * a function but it *is* async and so you want the errors logged, if any.
 */
export function runInBackground(fn: () => Promise<unknown>): void {
  Promise.resolve(fn()).catch((error: Error) => {
    logger.error(`unhandled promise exception: ${error.message}`, {
      error,
    });
  });
}

/**
 * Resolves true if the condition returns true before the timeout, else false.
 */
export async function waitUntil(options: {
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
}): Promise<boolean> {
  const { condition, interval, timeout } = options;
  const poller$ = rxjs.interval(interval).pipe(
    rxjs.filter(() => condition()), // check if condition met yet
    rxjs.map(() => true), // convert interval number to true, condition met
    rxjs.take(1), // stop poller after conditions met
    rxjs.timeout(timeout), // abort if conditions not met in time
    rxjs.catchError(() => rxjs.of(false)) // convert timeout error to false
  );
  return rxjs.firstValueFrom(poller$); // resolves once a value is emitted
}
