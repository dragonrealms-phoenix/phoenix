/**
 * Map of game codes to their user-friendly game instance labels.
 */
export const GameCodeLabels: Record<string, string> = {
  DR: 'Prime',
  DRX: 'Platinum',
  DRF: 'Fallen',
  DRT: 'Test',
  DRD: 'Development',
};

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
  value: string;
}> = Object.entries(GameCodeLabels).map(([gameCode, label]) => {
  return {
    label,
    value: gameCode,
  };
});
