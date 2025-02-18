import type { EuiThemeColorMode } from '@elastic/eui';

export interface GameLogLine {
  /**
   * A unique id for this log line.
   * Primarily used for React keys.
   * https://react.dev/learn/rendering-lists
   */
  eventId: string;
  /**
   * The game stream id that this line is destined for.
   * Example: 'percWindow' for spells.
   */
  streamId: string;
  /**
   * The text to display.
   */
  text: string;
  /**
   * The text formatting to apply to the entire line.
   * Overrides the default stream style.
   * See {@link GameStreamStyle} for details.
   */
  style?: GameLogLineStyle;
}

/**
 * The text formatting to apply to a single line of text.
 */
export interface GameLogLineStyle {
  /**
   * The theme color mode to use (e.g. 'light' or 'dark').
   */
  colorMode: EuiThemeColorMode;
  /**
   * See `GameEventType.TEXT_OUTPUT_CLASS` for possible values.
   * For example, 'mono' for monospaced text, or '' for normal text.
   */
  outputClass?: string;
  /**
   * See `GameEventType.TEXT_STYLE_PRESET` for possible values.
   * For example, 'roomName' or 'roomDesc' or 'whisper', etc.
   */
  stylePreset?: string;
  /**
   * Use a bold font weight.
   * Since this applies to the entire line, usually used for room titles.
   */
  bold?: boolean;
  /**
   * Use a subdued text color.
   * Primarily used to style the command text we echo back to the user.
   */
  subdued?: boolean;
}

/**
 * The default text formatting to apply to the entire stream.
 * Styles may be overridden on a line-by-line basis.
 * See {@link GameLogLine} for details.
 */
export interface GameStreamStyle {
  /**
   * The font family to use for the text.
   * For example, "Verdana" or "Courier New".
   */
  textFont: string;
  /**
   * The font size to use for the text, in pixels.
   * For example, 12.
   */
  textSize: number;
  /**
   * The color name or hex code to use for the text.
   * For example, "red" or "#FF0000".
   * Though any valid CSS color value will work.
   */
  foregroundColor: string;
  /**
   * The color name or hex code to use for the background.
   * For example, "blue" or "#0000FF".
   * Though any valid CSS color value will work.
   */
  backgroundColor: string;
}
