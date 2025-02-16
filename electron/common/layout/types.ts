export interface Layout {
  /**
   * Layout configurations for the app window.
   * For example, where the app is displayed on the monitor.
   */
  window: WindowLayout;
  /**
   * Layout configurations for each game stream window.
   * For example, where and how the "main" or "room" streams are displayed.
   */
  items: Array<ItemLayout>;
}

/**
 * Layout configuration for the app window.
 * Coordinates are relative to the monitor screen.
 */
export interface WindowLayout {
  /**
   * The x-coordinate of the app, in pixels.
   * This is the leftmost edge of the app.
   * This is the absolute position on the monitor screen.
   */
  x: number;
  /**
   * The y-coordinate of the app, in pixels.
   * This is the topmost edge of the app.
   * This is the absolute position on the monitor screen.
   */
  y: number;
  /**
   * The width of the app, in pixels.
   */
  width: number;
  /**
   * The height of the app, in pixels.
   */
  height: number;
}

/**
 * Layout configuration for a game stream.
 * Coordinates are relative to the grid item container.
 */
export interface ItemLayout {
  /**
   * Game-specific identifier for the stream.
   * For example, "percWindow" for the active spells stream.
   * For the main catch-all stream, use "main" instead of empty string.
   */
  id: string;
  /**
   * Title to display for the stream in the app.
   * For example, "Active Spells" or "Inventory".
   */
  title: string;
  /**
   * Whether the stream is displayed in the app.
   * When false then this stream's content can be redirected to
   * another stream window using the `whenHiddenRedirectToId` property.
   */
  visible: boolean;
  /**
   * The x-coordinate of the stream window, in pixels.
   * Relative to where the streams are displayed within the app.
   * This is not the absolute position on the monitor screen.
   */
  x: number;
  /**
   * The y-coordinate of the stream window, in pixels.
   * Relative to where the streams are displayed within the app.
   * This is not the absolute position on the monitor screen.
   */
  y: number;
  /**
   * The width of the stream window, in pixels.
   */
  width: number;
  /**
   * The height of the stream window, in pixels.
   */
  height: number;
  /**
   * The font family to use for the stream content.
   * Example: 'Verdana' or 'Courier New'.
   */
  textFont: string;
  /**
   * The font size to use for the stream content, in pixels.
   * Example: 12.
   */
  textSize: number;
  /**
   * The color of the text in the stream content.
   * Can be color names (e.g. 'blue') or hex codes ('#00FF00').
   */
  foregroundColor: string;
  /**
   * The color of the background in the stream content.
   * Can be color names (e.g. 'blue') or hex codes ('#00FF00').
   */
  backgroundColor: string;
  /**
   * When this stream is not visible, redirect its content to another stream.
   * If that stream is also not visible, then it continues to be redirected
   * until either a visible stream in the chain is found or not.
   *
   * Example Scenarios
   * -----------------
   * Given the following configuration:
   *  - When StreamA is hidden it redirects to StreamB.
   *  - When StreamB is hidden it redirects to StreamC.
   *  - When StreamC is hidden it does not redirect anywhere.
   *
   * Then:
   *  - When all streams are visible, their content is displayed as normal.
   *  - When StreamA is hidden, its content is redirected to StreamB.
   *  - When StreamB is also hidden, both StreamA and StreamB redirect to StreamC.
   *  - When StreamC is also hidden, no content is displayed.
   */
  whenHiddenRedirectToId: string;
}
