// Inspired by react-crop-video project by BiteSize Academy.
// https://github.com/alexkrkn/react-crop-video/
// https://www.youtube.com/watch?v=vDxZLN6FVqY

import type { ReactNode } from 'react';
import { useState } from 'react';
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

  const [focusedItemId, setFocusedItemId] = useState<string>('');

  // TODO when an item is closed then remove it from layout and save layout
  // TODO when user adds an item to the grid then add it to layout and save layout
  //    - refer to UX of Genie client for adding items to the grid
  // TODO when an item is dragged or resized then save layout
  //    - need to pass callback to grid items to know whey their position or size changes

  const item1 = (
    <GridItem
      key="1"
      itemId="1"
      titleBarText="Item 1"
      isFocused={focusedItemId === '1'}
      onFocus={setFocusedItemId}
      onClose={() => {
        alert('Closed item 1');
      }}
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
      onFocus={setFocusedItemId}
      onClose={() => {
        alert('Closed item 2');
      }}
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
