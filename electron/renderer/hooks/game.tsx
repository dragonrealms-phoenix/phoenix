import { useContext } from 'react';
import type { GameContextValue } from '../context/game';
import { GameContext } from '../context/game';

/**
 * To use this hook, the component must be wrapped in a `GameProvider`
 * somewhere in the parent hierarchy.
 */
export const useGame = (): GameContextValue => {
  return useContext(GameContext);
};
