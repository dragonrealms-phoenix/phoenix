import type { Maybe } from '../types.js';

export const equalsIgnoreCase = (
  a: Maybe<string>,
  b: Maybe<string>
): boolean => {
  return a?.toLowerCase() === b?.toLowerCase();
};
