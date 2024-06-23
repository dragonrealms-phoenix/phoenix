// Inspired by react-crop-video project by BiteSize Academy.
// https://github.com/alexkrkn/react-crop-video/
// https://www.youtube.com/watch?v=vDxZLN6FVqY

import type { ReactNode } from 'react';
import { useState } from 'react';
import { DraggableItem } from '../draggable/draggable-item.jsx';

export interface Grid4Props {
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
}

export const Grid4: React.FC<Grid4Props> = (props: Grid4Props): ReactNode => {
  const { boundary } = props;

  const [focusedItemId, setFocusedItemId] = useState<string>('');

  const item1 = (
    <DraggableItem
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
    </DraggableItem>
  );

  const item2 = (
    <DraggableItem
      key="2"
      itemId="2"
      titleBarText="Item 2"
      isFocused={focusedItemId === '2'}
      onFocus={setFocusedItemId}
      onClose={() => {
        alert('Closed item 2');
      }}
      boundary={boundary}
    >
      <div>Content2</div>
    </DraggableItem>
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
