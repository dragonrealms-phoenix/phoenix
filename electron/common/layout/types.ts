export interface Layout {
  window: WindowLayout;
  streams: Array<StreamLayout>;
}

/**
 * Layout configuration for the app window.
 */
export interface WindowLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Layout configuration for a game stream.
 */
export interface StreamLayout {
  /**
   * Game-specific identifier for the stream.
   * For example, "percWindow" for the active spells stream.
   */
  id: string;
  /**
   * Title to display for the stream in the app.
   */
  title: string;
  /**
   * Whether the stream is displayed in the app.
   * When false then this stream's content can be redirected to
   * another stream window using the `whenHiddenStreamToId` property.
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
   */
  textSize: number;
  /**
   * The color of the text in the stream content.
   */
  foregroundColor: string;
  /**
   * The color of the background in the stream content.
   */
  backgroundColor: string;
  /**
   * When this stream is not visible, redirect its content to another stream.
   * If that stream is also not visible, then it continues to be redirected
   * until either a visible stream in the chain is found or not.
   *
   * Example Scenario
   * ----------------
   * When StreamA is hidden it redirects to StreamB.
   * When StreamB is hidden it redirects to STreamC.
   * When StreamC is hidden it does not redirect anywhere.
   *
   * When all streams are visible then their content is displayed as normal.
   * When StreamA is hidden, its content is redirected to StreamB.
   * When StreamB is also hidden, both StreamA and StreamB redirect to StreamC.
   * When StreamC is also hidden, no content is displayed.
   */
  whenHiddenStreamToId?: string;
}
