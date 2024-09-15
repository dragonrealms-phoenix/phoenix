import type { ReactNode } from 'react';
import type { GameItemInfo } from './game.types.js';

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
   * Info about the game stream that this grid item is for.
   */
  gameItemInfo: GameItemInfo;
  /**
   * When this item is visible (i.e. added to the grid layout)
   * then these are the grid item ids where to stream this item's content.
   * Usually, this is the item's own id.
   */
  whenVisibleStreamToItemIds: Array<string>;
  /**
   * When this item is hidden (i.e. removed from the grid layout)
   * then these are the grid item ids where to stream this item's content.
   * Usually, the fallback is the main grid item or empty array.
   */
  whenHiddenStreamToItemIds: Array<string>;
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
