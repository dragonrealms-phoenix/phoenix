/**
 * Resolves after the given number of milliseconds.
 * Promisified version of `setTimeout`.
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
