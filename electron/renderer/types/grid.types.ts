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
  layout: GridItemLayout;
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
  layout: GridItemLayout;
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
export interface GridItemLayout {
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
