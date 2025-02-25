import type { GameCode } from '../../../common/game/types.js';
import { GameCodeMetaMap } from '../../../common/game/types.js';

/**
 * An array of label-value pairs to power HTML select inputs.
 */
export const GameCodeSelectOptions: Array<{
  /**
   * User-friendly label for the game instance.
   * Example: 'Prime'
   */
  label: string;
  /**
   * Game code for the game instance.
   * Example: 'DR'
   */
  value: GameCode;
}> = Object.values(GameCodeMetaMap).map((gameMeta) => {
  const { name, code } = gameMeta;
  return {
    label: name,
    value: code,
  };
});
