// Inspired by react-crop-video project by BiteSize Academy.
// https://github.com/alexkrkn/react-crop-video/
// https://www.youtube.com/watch?v=vDxZLN6FVqY

import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { useLogger } from '../../hooks/logger.jsx';
import type { GridItemMetadata } from './grid-item.jsx';
import { GridItem } from './grid-item.jsx';

export interface GridProps {
  /**
   * The dimension for the grid.
   */
  boundary: {
    /**
     * The max height of the grid in pixels.
     */
    height: number;
    /**
     * The max width of the grid in pixels.
     */
    width: number;
  };
  // TODO indicate which items to show on the grid
}

export const Grid: React.FC<GridProps> = (props: GridProps): ReactNode => {
  const { boundary } = props;

  const logger = useLogger('cmp:grid');

  // TODO load layout from storage

  // TODO determine the focused item from the layout, if none, use the first one
  const [focusedItemId, setFocusedItemId] = useState<string>('');

  const onItemFocus = useCallback((itemMeta: GridItemMetadata) => {
    const { itemId } = itemMeta;
    setFocusedItemId(itemId);
    // TODO when an item is resized then save layout, including the focused item
  }, []);

  const onItemClose = useCallback(
    (itemMeta: GridItemMetadata) => {
      const { itemId } = itemMeta;
      // TODO when an item is closed then remove it from layout and save layout
      logger.debug(`closed item ${itemId}`);
    },
    [logger]
  );

  const onItemMoveResize = useCallback(
    (itemMeta: GridItemMetadata) => {
      const { itemId } = itemMeta;
      // TODO when an item is dragged then save layout
      logger.debug(`moved item ${itemId}`);
    },
    [logger]
  );

  // TODO when user adds an item to the grid then add it to layout and save layout
  //    - refer to UX of Genie client for adding items to the grid

  const item1 = (
    <GridItem
      key="1"
      itemId="1"
      titleBarText="Item 1"
      isFocused={focusedItemId === '1'}
      onFocus={onItemFocus}
      onClose={onItemClose}
      onMoveResize={onItemMoveResize}
      boundary={boundary}
    >
      <div>Content1</div>
    </GridItem>
  );

  const item2 = (
    <GridItem
      key="2"
      itemId="2"
      titleBarText="Experience"
      isFocused={focusedItemId === '2'}
      onFocus={onItemFocus}
      onClose={onItemClose}
      onMoveResize={onItemMoveResize}
      boundary={boundary}
    >
      <div>Content2a</div>
      <div>Content2b</div>
      <div>Content2c</div>
      <div>Content2d</div>
    </GridItem>
  );

  return (
    <div
      style={{
        overflow: 'hidden',
        position: 'relative',
        height: boundary.height,
        width: boundary.width,
      }}
    >
      {item1}
      {item2}
    </div>
  );
};
