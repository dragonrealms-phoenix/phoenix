import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLogger } from '../../hooks/logger.jsx';

// NOTE: This is getting the real-time drag and drop repositioning I want.
// However, if you move the mouse too fast then the cursor leaves behind
// the element and it stops moving. When you move your mouse back over it
// the element begins moving again, even if you're not holding down the mouse.

export interface Grid3Props {
  /**
   * The dimension for the grid.
   */
  dimensions: {
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

// We need to invoke our mouse event handlers from different event listeners
// that each have their own unique interface. Rather than force cast the events
// to the desired interface, which may introduce a bug later, we'll create
// a simplified interface that can be used from any event listener.
export interface GridMouseEvent {
  clientX: number;
  clientY: number;
}

export const Grid3: React.FC<Grid3Props> = (props: Grid3Props): ReactNode => {
  const { dimensions } = props;

  const logger = useLogger('page:grid3');

  const gridItemRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const onMouseDown = useCallback(
    (event: GridMouseEvent) => {
      logger.debug('onMouseDown');
      setIsDragging(true);
      setDragOffset({
        x: event.clientX - position.x,
        y: event.clientY - position.y,
      });
    },
    [logger, position]
  );

  const onMouseMove = useCallback(
    (event: GridMouseEvent) => {
      if (!gridItemRef.current) {
        return;
      }

      if (isDragging) {
        let newX = event.clientX - dragOffset.x;
        let newY = event.clientY - dragOffset.y;

        // If the new position would reach farther left than the parent
        // then adjust the position of the left edge of the element
        // to be at the left edge of the parent.
        if (newX < 0) {
          newX = 0;
        }

        // If the new position would reach farther up than the parent
        // then adjust the position of the top edge of the element
        // to be at the top edge of the parent.
        if (newY < 0) {
          newY = 0;
        }

        // If the new position would reach farther right than the parent
        // then adjust the position of the right edge of the element
        // to be at the right edge of the parent.
        if (newX + gridItemRef.current.clientWidth > dimensions.width) {
          newX = dimensions.width - gridItemRef.current.clientWidth;
        }

        // If the new position would reach farther down than the parent
        // then adjust the position of the bottom edge of the element
        // to be at the bottom edge of the parent.
        if (newY + gridItemRef.current.clientHeight > dimensions.height) {
          newY = dimensions.height - gridItemRef.current.clientHeight;
        }

        logger.debug('onMouseMove - dragging', {
          calcX: event.clientX - dragOffset.x,
          calcY: event.clientY - dragOffset.y,
          newX,
          newY,
        });

        setPosition({
          x: newX,
          y: newY,
        });
      }
    },
    [logger, dimensions, isDragging, dragOffset]
  );

  const onMouseUp = useCallback(
    (_event: GridMouseEvent) => {
      logger.debug('onMouseUp');
      setIsDragging(false);
    },
    [logger]
  );

  // When we attach the `mousemove` event listeners to the draggable element
  // then if the mouse moves too quickly then it can leave the element behind.
  // Once that happens, then the mouse events stop being emitted and so it
  // doesn't reposition to stay under the mouse cursor.
  // A workaround is to attach the `mousemove` event listeners to the `window`
  // so that the event always fires.
  useEffect(() => {
    const windowOnMouseMove = (event: WindowEventMap['mousemove']) => {
      onMouseMove(event);
    };

    const windowOnMouseUp = (event: WindowEventMap['mouseup']) => {
      onMouseUp(event);
    };

    window.addEventListener('mousemove', windowOnMouseMove);
    window.addEventListener('mouseup', windowOnMouseUp);

    return () => {
      window.removeEventListener('mousemove', windowOnMouseMove);
      window.removeEventListener('mouseup', windowOnMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  return (
    <div
      style={{
        height: dimensions.height,
        width: dimensions.width,
      }}
    >
      <div
        ref={gridItemRef}
        style={{
          width: '100px',
          height: '100px',
          backgroundColor: 'lightblue',
          position: 'relative',
          top: `${position.y}px`,
          left: `${position.x}px`,
          cursor: 'move',
        }}
        onMouseDown={onMouseDown}
        // onMouseMove={onMouseMove}
        // onMouseUp={onMouseUp}
        // onMouseLeave={onMouseLeave}
      >
        Drag me!
      </div>
    </div>
  );
};

Grid3.displayName = 'Grid3';
