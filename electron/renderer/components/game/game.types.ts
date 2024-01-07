import type { SerializedStyles } from '@emotion/react';

export interface GameLogLine {
  /**
   * A unique id for this log line.
   * Primarily used for React keys.
   * https://react.dev/learn/rendering-lists
   */
  eventId: string;
  /**
   * The game stream id that this line is destined for.
   */
  streamId: string;
  /**
   * The text formatting to apply to this line.
   */
  styles: SerializedStyles;
  /**
   * The text to display.
   */
  text: string;
}
