// Inspired by react-crop-video project by BiteSize Academy.
// https://github.com/alexkrkn/react-crop-video/
// https://www.youtube.com/watch?v=vDxZLN6FVqY

import { animated, useSpring } from '@react-spring/web';
import type { EventTypes, Handler, UserDragConfig } from '@use-gesture/react';
import { useDrag } from '@use-gesture/react';
import get from 'lodash-es/get';
import isNil from 'lodash-es/isNil';
import type { MouseEvent, ReactNode, RefObject } from 'react';
import { useCallback, useMemo, useRef } from 'react';
import { useLogger } from '../../hooks/logger.jsx';

export interface DraggableItemProps {
  /**
   * The dimension for the grid where the item may be dragged and resized.
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
  /**
   * The unique identifier for the grid item.
   */
  itemId: string;
  /**
   * Text to display in the title bar of the grid item.
   * Note the prop `title` is reserved and refers to titling a DOM element,
   * not for passing data to child components. So using a more specific name.
   */
  titleBarText: string;
  /**
   * Handler when the user clicks the close button in the title bar.
   * Passes the `itemId` of the grid item being closed.
   */
  onClose?: (itemId: string) => void;
  /**
   * Is this the focused grid item?
   * When yes then it will be positioned above the other grid items.
   */
  isFocused?: boolean;
  /**
   * When the grid item receives focus then notify the parent component.
   * The parent component has responsibility for managing the `isFocused`
   * property for all of the grid items to reflect the change.
   */
  onFocus?: (itemId: string) => void;
  /**
   * This property contains any children nested within the grid item
   * when you're constructing the grid layout.
   * You must nest it within the root element of the grid item.
   */
  children?: ReactNode;
}

export const DraggableItem: React.FC<DraggableItemProps> = (
  props: DraggableItemProps
): ReactNode => {
  const { boundary, itemId, titleBarText } = props;
  const { isFocused, onFocus, onClose, children } = props;

  const logger = useLogger('draggable-item');

  // Handle when the user clicks the close button in the title bar.
  const onCloseClick = useCallback(
    (evt: MouseEvent<HTMLElement>) => {
      evt.preventDefault();
      if (onClose) {
        onClose(itemId);
      }
    },
    [onClose, itemId]
  );

  const [{ x, y, width, height }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  }));

  const dragHandleRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  /**
   * Is the event target the same element as the ref?
   */
  const isEventTarget = useCallback(
    (
      eventOrTarget: Event | EventTarget | null | undefined,
      ref: RefObject<HTMLElement>
    ) => {
      if (isNil(eventOrTarget)) {
        return false;
      }

      if (eventOrTarget === ref.current) {
        return true;
      }

      if (get(eventOrTarget, 'target') === ref.current) {
        return true;
      }

      if (get(eventOrTarget, 'currentTarget') === ref.current) {
        return true;
      }

      return false;
    },
    []
  );

  /**
   * Did the user click and drag the drag handle?
   */
  const isDragging = useCallback(
    (eventOrTarget: Event | EventTarget | null | undefined): boolean => {
      return isEventTarget(eventOrTarget, dragHandleRef);
    },
    [isEventTarget]
  );

  /**
   * Did the user click and drag the resize handle?
   */
  const isResizing = useCallback(
    (eventOrTarget: Event | EventTarget | null | undefined): boolean => {
      return isEventTarget(eventOrTarget, resizeHandleRef);
    },
    [isEventTarget]
  );

  const dragHandler: Handler<'drag', EventTypes['drag']> = useCallback(
    /**
     * Callback to invoke when a gesture event ends.
     * For example, when the user stops dragging or resizing.
     */
    (state) => {
      // The vector for where the pointer has moved to relative to
      // the last vector returned by the `from` drag option function.
      // When resizing, the values are the new width and height dimensions.
      // When dragging, the values are the new x and y coordinates.
      const [dx, dy] = state.offset;

      if (isResizing(state.event)) {
        api.set({ width: dx, height: dy });
      }

      if (isDragging(state.event)) {
        api.set({ x: dx, y: dy });
      }

      // On the start of a gesture, ensure the grid item is visible
      // above all other grid items that may be overlapping it.
      if (state.active) {
        if (onFocus) {
          onFocus(itemId);
        }
      }
    },
    [itemId, api, isResizing, isDragging, onFocus]
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
        const containerWidth = boundary.width;
        const containerHeight = boundary.height;
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
  }, [x, y, width, height, boundary, isResizing]);

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
        touchAction: 'none',
        zIndex: isFocused ? 999 : 888,
      }}
      {...bind()}
    >
      <div
        ref={dragHandleRef}
        style={{
          position: 'absolute',
          width: '100%',
          height: '20px',
          cursor: 'move',
          backgroundColor: 'red',
          textAlign: 'center',
        }}
      >
        Drag Handle
      </div>

      {children}

      <div
        ref={resizeHandleRef}
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

DraggableItem.displayName = 'DraggableItem';
