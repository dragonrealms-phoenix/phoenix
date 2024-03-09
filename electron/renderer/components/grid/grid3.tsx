import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLogger } from '../../hooks/logger.jsx';

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

// We need to invoke our pointer event handlers from different event listeners
// that each have their own unique interface. Rather than force cast the events
// to the desired interface, which may introduce a bug later, we'll create
// a simplified interface that can be used from any event listener.
export interface GridPointerEvent {
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
    (event: GridPointerEvent) => {
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
    (event: GridPointerEvent) => {
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

  const onPointerMove = useMemo(() => {
    const handler = (event: GridPointerEvent) => {
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

        newX = Math.floor(newX);
        newY = Math.floor(newY);

        logger.debug('onPointerMove - dragging', {
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

        newWidth = Math.floor(newWidth);
        newHeight = Math.floor(newHeight);

        logger.debug('onPointerMove - resizing', {
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
    };

    return handler;
  }, [
    logger,
    gridDimensions,
    isDragging,
    dragOffset,
    isResizing,
    resizeOffset,
    dimensionBeforeResize,
  ]);

  const onPointerUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  useEffect(() => {
    // To ensure continuous repositioning of the draggable element under the
    // cursor, we attach the `pointermove` event listeners to the `window`
    // instead of the draggable element itself. This prevents the issue of the
    // element being left behind when the pointer moves too quickly.
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerleave', onPointerUp);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('blur', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerUp);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('blur', onPointerUp);
    };
  }, [onPointerMove, onPointerUp]);

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
          onPointerDown={onDragStart}
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
          onPointerDown={onResizeStart}
        ></div>
      </div>
    </div>
  );
};

Grid3.displayName = 'Grid3';
