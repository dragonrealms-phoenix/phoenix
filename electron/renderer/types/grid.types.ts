import type { ReactNode } from 'react';

export interface GridItemContent extends GridItemInfo {
  /**
   * The content to display in the grid item.
   */
  content: ReactNode;
}

/**
 * The information shared between the grid item and the grid.
 * For example, to notify when the item's layout or position changes.
 */
export interface GridItemInfo {
  itemId: string;
  itemTitle: string;
  isFocused: boolean;
  position: GridItemPosition;
}

export interface GridItemConfig {
  /**
   * Game-specific identifier for the grid item stream.
   * For example, "percWindow".
   */
  itemId: string;
  /**
   * User-friendly title for the grid item stream.
   * For example, "Active Spells".
   */
  itemTitle: string;
  /**
   * Include this in the layout?
   */
  isVisible: boolean;
  /**
   * The initial position for the grid item.
   */
  position: GridItemPosition;
  /**
   * The styling for the grid item.
   */
  style: GridItemStyle;
  /**
   * When this item is not visible, redirect its content to another item.
   * If that item is also not visible, then it continues to be redirected
   * until either a visible item in the chain is found or not.
   */
  whenHiddenRedirectToItemId: string | null;
}

/**
 * The dimension for the grid where the item may be dragged and resized.
 */
export interface GridItemBoundary {
  /**
   * The max height of the grid in pixels.
   */
  height: number;
  /**
   * The max width of the grid in pixels.
   */
  width: number;
}

/**
 * The positional layout for the grid item.
 */
export interface GridItemPosition {
  /**
   * The x coordinate for the grid item.
   * The leftmost edge of the grid item.
   */
  x: number;
  /**
   * The y coordinate for the grid item.
   * The topmost edge of the grid item.
   */
  y: number;
  /**
   * The width dimension for the grid item.
   * The horizontal length of the grid item.
   * Rightmost edge is `x + width`.
   */
  width: number;
  /**
   * The height dimension for the grid item.
   * The vertical length of the grid item.
   * Bottommost edge is `y + height`.
   */
  height: number;
}

/**
 * The font styling for the grid item.
 */
export interface GridItemStyle {
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
