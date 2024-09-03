import { logger } from './logger.js';

/**
 * For "fire and forget" scenarios when you don't want, or can't, await
 * a function but it *is* async and so you want the errors logged, if any.
 */
export const runInBackground = (fn: () => Promise<unknown>): void => {
  try {
    Promise.resolve(fn()).catch((error: Error) => {
      // TODO emit to pubsub
      logger.error(`unhandled promise exception: ${error.message}`, {
        error,
      });
    });
  } catch (error) {
    // TODO emit to pubsub
    logger.error(`unhandled promise exception: ${error.message}`, {
      error,
    });
  }
};
