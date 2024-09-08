// Inspired by react-crop-video project by BiteSize Academy.
// https://github.com/alexkrkn/react-crop-video/
// https://www.youtube.com/watch?v=vDxZLN6FVqY

import type { ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useLogger } from '../../hooks/logger.jsx';
import type { GridItemMetadata } from './grid-item.jsx';
import { GridItem } from './grid-item.jsx';

export interface GridContentItem {
  layout: GridItemMetadata;
  content: ReactNode;
}

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
  contentItems: Array<GridContentItem>;
}

export const Grid: React.FC<GridProps> = (props: GridProps): ReactNode => {
  const { boundary, contentItems } = props;

  const logger = useLogger('cmp:grid');

  // TODO when user adds an item to the grid then add it to layout and save layout

  const focusedContentItemId = useMemo(() => {
    const focusedItem = contentItems.find((contentItem) => {
      return contentItem.layout.isFocused;
    });
    return focusedItem?.layout?.itemId ?? '';
  }, [contentItems]);

  const [focusedItemId, setFocusedItemId] =
    useState<string>(focusedContentItemId);

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

  const gridItems = useMemo(() => {
    return contentItems.map((contentItem) => {
      return (
        <GridItem
          key={contentItem.layout.itemId}
          itemId={contentItem.layout.itemId}
          titleBarText={contentItem.layout.title}
          isFocused={contentItem.layout.itemId === focusedItemId}
          onFocus={onItemFocus}
          onClose={onItemClose}
          onMoveResize={onItemMoveResize}
          boundary={boundary}
        >
          {contentItem.content}
        </GridItem>
      );
    });
  }, [
    contentItems,
    focusedItemId,
    boundary,
    onItemFocus,
    onItemClose,
    onItemMoveResize,
  ]);

  return (
    <div
      style={{
        overflow: 'hidden',
        position: 'relative',
        height: boundary.height,
        width: boundary.width,
      }}
    >
      {gridItems}
    </div>
  );
};
