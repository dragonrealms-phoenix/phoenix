// Inspired by react-crop-video project by BiteSize Academy.
// https://github.com/alexkrkn/react-crop-video/
// https://www.youtube.com/watch?v=vDxZLN6FVqY

import type { ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useLogger } from '../../hooks/logger.jsx';
import type {
  GridItemBoundary,
  GridItemContent,
  GridItemInfo,
} from '../../types/grid.types.js';
import { GridItem } from './grid-item.jsx';

export interface GridProps {
  boundary: GridItemBoundary;
  contentItems: Array<GridItemContent>;
}

export const Grid: React.FC<GridProps> = (props: GridProps): ReactNode => {
  const { boundary, contentItems } = props;

  const logger = useLogger('cmp:grid');

  // TODO when user adds an item to the grid then add it to layout and save layout

  const focusedContentItemId = useMemo(() => {
    const focusedItem = contentItems.find((contentItem) => {
      return contentItem.isFocused;
    });
    return focusedItem?.itemId ?? '';
  }, [contentItems]);

  const [focusedItemId, setFocusedItemId] =
    useState<string>(focusedContentItemId);

  const onItemFocus = useCallback((item: GridItemInfo) => {
    const { itemId } = item;
    setFocusedItemId(itemId);
    // TODO when an item is resized then save layout, including the focused item
  }, []);

  const onItemClose = useCallback(
    (item: GridItemInfo) => {
      const { itemId } = item;
      // TODO when an item is closed then remove it from layout and save layout
      logger.debug(`closed item ${itemId}`);
    },
    [logger]
  );

  const onItemMoveResize = useCallback(
    (item: GridItemInfo) => {
      const { itemId } = item;
      // TODO when an item is dragged then save layout
      logger.debug(`moved item ${itemId}`);
    },
    [logger]
  );

  const gridItems = useMemo(() => {
    return contentItems.map((contentItem) => {
      return (
        <GridItem
          key={contentItem.itemId}
          itemId={contentItem.itemId}
          itemTitle={contentItem.itemTitle}
          isFocused={contentItem.itemId === focusedItemId}
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
