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
  const gridDimensions = props.dimensions;

  const logger = useLogger('page:grid3');

  const gridItemRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dimension, setDimension] = useState({ width: 100, height: 100 });

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [isResizing, setIsResizing] = useState(false);
  const [resizeOffset, setResizeOffset] = useState({ x: 0, y: 0 });
  const [dimensionBeforeResize, setDimensionBeforeResize] = useState(dimension);

  const onDragStart = useCallback(
    (event: GridMouseEvent) => {
      logger.debug('onDragStart');

      setIsDragging(true);

      setDragOffset({
        x: event.clientX - position.x,
        y: event.clientY - position.y,
      });
    },
    [logger, position]
  );

  const onResizeStart = useCallback(
    (event: GridMouseEvent) => {
      logger.debug('onResizeStart');

      setIsResizing(true);

      setResizeOffset({
        x: event.clientX,
        y: event.clientY,
      });

      setDimensionBeforeResize({
        width: dimension.width,
        height: dimension.height,
      });
    },
    [logger, dimension]
  );

  const onMouseMove = useCallback(
    (event: GridMouseEvent) => {
      const handleDrag = () => {
        if (!gridItemRef.current) {
          return;
        }

        const currentWidth = gridItemRef.current.clientWidth;
        const currentHeight = gridItemRef.current.clientHeight;

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
        if (newX + currentWidth > gridDimensions.width) {
          newX = gridDimensions.width - currentWidth;
        }

        // If the new position would reach farther down than the parent
        // then adjust the position of the bottom edge of the element
        // to be at the bottom edge of the parent.
        if (newY + currentHeight > gridDimensions.height) {
          newY = gridDimensions.height - currentHeight;
        }

        logger.debug('onMouseMove - dragging', {
          newX,
          newY,
        });

        setPosition({
          x: newX,
          y: newY,
        });
      };

      const handleResize = () => {
        if (!gridItemRef.current) {
          return;
        }

        const currentLeft = gridItemRef.current.offsetLeft;
        const currentTop = gridItemRef.current.offsetTop;

        const currentWidth = dimensionBeforeResize.width;
        const currentHeight = dimensionBeforeResize.height;

        const deltaWidth = event.clientX - resizeOffset.x;
        const deltaHeight = event.clientY - resizeOffset.y;

        let newWidth = currentWidth + deltaWidth;
        let newHeight = currentHeight + deltaHeight;

        // If the new size would shrink the element to be smaller than
        // the minimum size then set the size to the minimum.
        const minWidth = 50;
        const minHeight = 50;

        if (newWidth < minWidth) {
          newWidth = minWidth;
        }

        if (newHeight < minHeight) {
          newHeight = minHeight;
        }

        // If the new size would reach farther right than the parent then
        // adjust the size of the element to be at the right edge of the parent.
        if (currentLeft + newWidth > gridDimensions.width) {
          newWidth = gridDimensions.width - currentLeft;
        }

        // If the new size would reach farther down than the parent then
        // adjust the size of the element to be at the bottom edge of the parent.
        if (currentTop + newHeight > gridDimensions.height) {
          newHeight = gridDimensions.height - currentTop;
        }

        logger.debug('onMouseMove - resizing', {
          deltaWidth,
          deltaHeight,
          oldWidth: currentWidth,
          oldHeight: currentHeight,
          newWidth,
          newHeight,
          currentTop,
          currentLeft,
        });

        setDimension({
          width: newWidth,
          height: newHeight,
        });
      };

      if (isDragging) {
        handleDrag();
      }

      if (isResizing) {
        handleResize();
      }
    },
    [
      logger,
      gridDimensions,
      isDragging,
      dragOffset,
      isResizing,
      resizeOffset,
      dimensionBeforeResize,
    ]
  );

  const onMouseUp = useCallback(() => {
    logger.debug('onMouseUp');
    setIsDragging(false);
    setIsResizing(false);
  }, [logger]);

  // When we attach the `mousemove` event listeners to the draggable element
  // then if the mouse moves too quickly then it can leave the element behind.
  // Once that happens, then the mouse events stop being emitted and so it
  // doesn't reposition to stay under the mouse cursor.
  // A workaround is to attach the `mousemove` event listeners to the `window`
  // so that the event always fires.
  useEffect(() => {
    // Events that signal the user has stopped dragging or resizing.
    const onMouseUpEventAliases: Array<keyof WindowEventMap> = [
      'mouseup',
      'mouseleave',
      'blur',
    ];

    onMouseUpEventAliases.forEach((eventName) => {
      window.addEventListener(eventName, onMouseUp);
    });

    window.addEventListener('mousemove', onMouseMove);

    return () => {
      onMouseUpEventAliases.forEach((eventName) => {
        window.removeEventListener(eventName, onMouseUp);
      });

      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [onMouseMove, onMouseUp]);

  return (
    <div
      style={{
        position: 'relative',
        height: gridDimensions.height,
        width: gridDimensions.width,
      }}
    >
      <div
        ref={gridItemRef}
        style={{
          position: 'relative',
          top: `${position.y}px`,
          left: `${position.x}px`,
          width: `${dimension.width}px`,
          height: `${dimension.height}px`,
          backgroundColor: 'lightblue',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '20px',
            backgroundColor: 'red',
            cursor: isDragging ? 'grabbing' : 'grab',
            textAlign: 'center',
          }}
          onMouseDown={onDragStart}
        >
          Drag Handle
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            borderLeft: '10px solid transparent',
            borderBottom: '10px solid green',
            cursor: 'se-resize',
          }}
          onMouseDown={onResizeStart}
        ></div>
      </div>
    </div>
  );
};

Grid3.displayName = 'Grid3';
