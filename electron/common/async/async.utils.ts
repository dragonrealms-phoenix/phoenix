import { createLogger } from '../logger/logger.utils';

const logger = createLogger('async:utils');

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * For "fire and forget" scenarios when you don't want, or can't, await
 * a function but it *is* async and so you want the errors logged, if any.
 */
export const runInBackground = (fn: () => Promise<unknown>): void => {
  Promise.resolve(fn()).catch((error) => {
    logger.error(`unhandled promise exception: ${error?.message}`, {
      error,
    });
  });
};
