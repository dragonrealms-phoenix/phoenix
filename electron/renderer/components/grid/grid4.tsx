// Inspired by react-crop-video project by BiteSize Academy.
// https://github.com/alexkrkn/react-crop-video/
// https://www.youtube.com/watch?v=vDxZLN6FVqY

import { animated, useSpring } from '@react-spring/web';
import type { EventTypes, Handler, UserDragConfig } from '@use-gesture/react';
import { useDrag } from '@use-gesture/react';
import isNil from 'lodash-es/isNil.js';
import type { ReactNode, RefObject } from 'react';
import { useCallback, useMemo, useRef } from 'react';

export interface Grid4Props {
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

const GridItem4: React.FC<Grid4Props> = (props: Grid4Props): ReactNode => {
  const { dimensions: gridDimensions } = props;

  const [{ x, y, width, height }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  }));

  const draggableRef = useRef<HTMLDivElement>(null);
  const resizableRef = useRef<HTMLDivElement>(null);

  const isEventTarget = useCallback(
    (
      eventOrTarget: Event | EventTarget | null | undefined,
      ref: RefObject<HTMLElement>
    ) => {
      if (isNil(eventOrTarget)) {
        return false;
      }
      if ('target' in eventOrTarget) {
        return eventOrTarget.target === ref.current;
      }
      return eventOrTarget === ref.current;
    },
    []
  );

  const isDragging = useCallback(
    (eventOrTarget: Event | EventTarget | null | undefined): boolean => {
      return isEventTarget(eventOrTarget, draggableRef);
    },
    [isEventTarget]
  );

  const isResizing = useCallback(
    (eventOrTarget: Event | EventTarget | null | undefined): boolean => {
      return isEventTarget(eventOrTarget, resizableRef);
    },
    [isEventTarget]
  );

  const dragHandler: Handler<'drag', EventTypes['drag']> = useCallback(
    /**
     * Callback to invoke when a gesture event ends.
     * For example, when the user stops dragging or resizing.
     */
    (state) => {
      // The cumulative displacements the pointer has moved relative to
      // the last vector returned by the `from` drag option function.
      const [dx, dy] = state.offset;

      if (isResizing(state.event)) {
        // When resizing, the values are the new width and height dimensions.
        api.set({
          width: dx,
          height: dy,
        });
      } else if (isDragging(state.event)) {
        // When dragging, the values are the new x and y coordinates.
        api.set({
          x: dx,
          y: dy,
        });
      }
    },
    [api, isResizing, isDragging]
  );

  const dragOptions: UserDragConfig = useMemo(() => {
    return {
      /**
       * When a gesture event begins, specify the reference vector
       * from which to calculate the distance the pointer moves.
       */
      from: (state) => {
        if (isResizing(state.target)) {
          return [width.get(), height.get()];
        }
        return [x.get(), y.get()];
      },
      /**
       * When a gesture event begins, specify the where the pointer can move.
       * The element will not be dragged or resized outside of these bounds.
       */
      bounds: (state) => {
        const containerWidth = gridDimensions.width;
        const containerHeight = gridDimensions.height;
        if (isResizing(state?.event)) {
          return {
            top: 50, // min height
            left: 50, // min width
            right: containerWidth - x.get(),
            bottom: containerHeight - y.get(),
          };
        }
        return {
          top: 0,
          left: 0,
          right: containerWidth - width.get(),
          bottom: containerHeight - height.get(),
        };
      },
    };
  }, [x, y, width, height, gridDimensions, isResizing]);

  const bind = useDrag(dragHandler, dragOptions);

  return (
    <animated.div
      style={{
        position: 'absolute',
        x,
        y,
        width,
        height,
        backgroundColor: 'brown',
        overflow: 'hidden',
      }}
      {...bind()}
    >
      <div
        ref={draggableRef}
        style={{
          width: '100%',
          height: '20px',
          cursor: 'move',
          backgroundColor: 'red',
          textAlign: 'center',
        }}
      >
        Drag Handle
      </div>

      <div
        style={{
          width: '100%',
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        This quick brown fox jumped over the fence.
      </div>

      <div
        ref={resizableRef}
        style={{
          position: 'absolute',
          bottom: -4,
          right: -4,
          width: 10,
          height: 10,
          cursor: 'nwse-resize',
          backgroundColor: '#0097df',
          borderRadius: 4,
        }}
      ></div>
    </animated.div>
  );
};

GridItem4.displayName = 'GridItem4';

export const Grid4: React.FC<Grid4Props> = (props: Grid4Props): ReactNode => {
  const gridDimensions = props.dimensions;

  return (
    <div
      style={{
        position: 'relative',
        height: gridDimensions.height,
        width: gridDimensions.width,
        overflow: 'hidden',
      }}
    >
      <GridItem4 dimensions={gridDimensions} />
      <GridItem4 dimensions={gridDimensions} />
    </div>
  );
};

Grid4.displayName = 'Grid4';
