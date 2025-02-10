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
   */
  styles?: {
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
  };
}

/**
 * When the game socket sends data, it may be tagged with a stream id.
 * The stream id indicates which game "window" the data is intended for.
 *
 * An item id is the unique identifier we use in Phoenix for the same
 * logical concept, but allows us to use more consistent or descriptive
 * values. Or in the case of the main stream, to use a non-blank value!
 *
 * Users will be allowed to create new streams to customize how
 * game content is routed to the UI. Sometimes custom scripts output
 * to specific streams, or DragonRealms introduces new streams before
 * we update the code to support them.
 */
export interface GameItemInfo {
  /**
   * Unique identifier for the game stream.
   * Assigned by DragonRealms.
   * Example: 'percWindow' for spells.
   */
  streamId: string;
  /**
   * Our logical id for the game stream item.
   * Generally matches the stream id, but more consistent.
   */
  itemId: GameItemId | string;
  /**
   * User-friendly title for the game stream.
   * Example: 'Spells' or 'Main'.
   */
  itemTitle: string;
}

export enum GameItemId {
  MAIN = 'main',
  EXPERIENCE = 'experience',
  ROOM = 'room',
  SPELLS = 'spells',
  INVENTORY = 'inventory',
  FAMILIAR = 'familiar',
  THOUGHTS = 'thoughts',
  COMBAT = 'combat',
  ASSESS = 'assess',
  ARRIVALS = 'arrivals',
  DEATHS = 'deaths',
  ATMOSPHERICS = 'atmospherics',
  CHATTER = 'chatter',
  CONVERSATION = 'conversation',
  WHISPERS = 'whispers',
  TALK = 'talk',
  OOC = 'ooc',
  GROUP = 'group',
}
