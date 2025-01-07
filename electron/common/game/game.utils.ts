import { toUpperSnakeCase } from '../string/string.utils.js';
import type { Maybe } from '../types.js';
import { ExperienceMindState } from './types.js';

/**
 * Helper function to look up the mind state value from its name
 * as parsed from the game text.
 *
 * For example, "clear" -> 0, "pondering" -> 7, "very focused" -> 21, etc.
 */
export const getExperienceMindState = (
  mindState: string
): Maybe<ExperienceMindState> => {
  return ExperienceMindState[
    toUpperSnakeCase(mindState) as keyof typeof ExperienceMindState
  ];
};
