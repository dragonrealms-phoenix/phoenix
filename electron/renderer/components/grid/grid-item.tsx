// Inspired by react-crop-video project by BiteSize Academy.
// https://github.com/alexkrkn/react-crop-video/
// https://www.youtube.com/watch?v=vDxZLN6FVqY

import {
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiSpacer,
  EuiSplitPanel,
  EuiText,
  useEuiTheme,
} from '@elastic/eui';
import { css } from '@emotion/react';
import { animated, useSpring } from '@react-spring/web';
import type { EventTypes, Handler, UserDragConfig } from '@use-gesture/react';
import { useDrag } from '@use-gesture/react';
import debounce from 'lodash-es/debounce.js';
import get from 'lodash-es/get';
import isNil from 'lodash-es/isNil';
import type { ReactNode, RefObject } from 'react';
import { memo, useCallback, useMemo, useRef } from 'react';
import type {
  GridItemBoundary,
  GridItemInfo,
  GridItemPosition,
  GridItemStyle,
} from '../../types/grid.types.js';

export interface GridItemProps {
  /**
   * The dimension for the grid where the item may be dragged and resized.
   */
  boundary: GridItemBoundary;
  /**
   * The positional layout for the grid item.
   * If not specified then a default location will be used.
   */
  position?: GridItemPosition;
  /**
   * The default font styling for the grid item.
   * It may be overridden on a line-by-line basis
   * based on game style presets and user preferences.
   */
  style?: GridItemStyle;
  /**
   * The unique identifier for the grid item.
   */
  itemId: string;
  /**
   * Text to display in the title bar of the grid item.
   * Note the prop `title` is reserved and refers to titling a DOM element,
   * not for passing data to child components. So using a more specific name.
   */
  itemTitle: string;
  /**
   * When the grid item is closed then notify the parent component.
   */
  onClose?: (item: GridItemInfo) => void;
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
  onFocus?: (item: GridItemInfo) => void;
  /**
   * When the grid item is moved or resized then notify the parent component.
   */
  onMoveResize?: (item: GridItemInfo) => void;
  /**
   * This property contains any children nested within the grid item
   * when you're constructing the grid layout.
   * You must nest it within the root element of the grid item.
   */
  children?: ReactNode;
}

const DEFAULT_GRID_ITEM_POSITION: GridItemPosition = {
  x: 0,
  y: 0,
  width: 500,
  height: 500,
};

const DEFAULT_GRID_ITEM_STYLE: GridItemStyle = {
  fontFamily: 'inherit',
  fontSize: 'inherit',
  foregroundColor: 'inherit',
  backgroundColor: 'inherit',
};

export const GridItem: React.FC<GridItemProps> = memo(
  (props: GridItemProps): ReactNode => {
    const { itemId, itemTitle, isFocused = false, children } = props;
    const { boundary, position = DEFAULT_GRID_ITEM_POSITION } = props;
    const { style = DEFAULT_GRID_ITEM_STYLE } = props;
    const { onFocus, onClose, onMoveResize } = props;

    const { euiTheme } = useEuiTheme();

    // Set default position and size for the grid item.
    // Like `useState`, we can provide the default value, but as a function.
    const [{ x, y, width, height }, sizeApi] =
      useSpring<GridItemPosition>(() => {
        return position;
      }, [position]);

    const dragHandleRef = useRef<HTMLDivElement>(null);
    const resizeHandleRef = useRef<HTMLDivElement>(null);

    const getItemInfo = useCallback((): GridItemInfo => {
      return {
        itemId,
        itemTitle,
        isFocused,
        style,
        position: {
          x: x.get(),
          y: y.get(),
          width: width.get(),
          height: height.get(),
        },
      };
    }, [itemId, itemTitle, isFocused, style, x, y, width, height]);

    // Handle when the user clicks the close button in the title bar.
    const onCloseClick = useCallback(() => {
      onClose?.(getItemInfo());
    }, [onClose, getItemInfo]);

    // Handle when the user clicks or focuses the grid item.
    const onFocusClick = useCallback(() => {
      if (!isFocused) {
        onFocus?.({
          ...getItemInfo(),
          isFocused: true,
        });
      }
    }, [onFocus, getItemInfo, isFocused]);

    // Handle when the user moves or resizes the grid item.
    // Because this event triggers frequently, we debounce it for performance.
    const onMoveResizeHandler = useMemo(() => {
      return debounce(() => {
        onMoveResize?.(getItemInfo());
      }, 300);
    }, [onMoveResize, getItemInfo]);

    /**
     * Is the event's target the same element as the ref?
     * This helps us identify if the user has clicked on
     * the drag or resize handle elements.
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
          if (
            width.get() !== Math.trunc(dx) ||
            height.get() !== Math.trunc(dy)
          ) {
            sizeApi.set({
              width: Math.trunc(dx),
              height: Math.trunc(dy),
            });
            onMoveResizeHandler();
          }
        }

        if (isDragging(state.event)) {
          if (x.get() !== Math.trunc(dx) || y.get() !== Math.trunc(dy)) {
            sizeApi.set({
              x: Math.trunc(dx),
              y: Math.trunc(dy),
            });
            onMoveResizeHandler();
          }
        }
      },
      [
        x,
        y,
        width,
        height,
        sizeApi,
        isResizing,
        isDragging,
        onMoveResizeHandler,
      ]
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
              left: 100, // min width
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

    // Use this function to add all of the DOM bindings props to the element(s)
    // that you want to make draggable or resizable.
    // Example: see our `dragHandleRef` and `resizeHandleRef` ref elements.
    const getMouseGestureDragBindings = useDrag(dragHandler, dragOptions);

    // Styles for our drag and resize handle elements.
    const handleStyles = useMemo(() => {
      return css({
        '.drag-handle': {
          cursor: 'grab',
        },
        '.drag-handle:active': {
          cursor: 'grabbing',
          touchAction: 'none',
        },
        '.resize-handle': {
          position: 'absolute',
          bottom: -4,
          right: -4,
          width: 10,
          height: 10,
          cursor: 'nwse-resize',
          touchAction: 'none',
          backgroundColor: euiTheme.colors.mediumShade,
          borderRadius: euiTheme.border.radius.medium,
        },
      });
    }, [euiTheme]);

    return (
      <animated.div // react-spring element, works with the `useSpring` values
        style={{
          position: 'absolute',
          x,
          y,
          width,
          height,
          overflow: 'hidden',
          touchAction: 'none',
          zIndex: isFocused ? 999 : 888, // arbitrary numbers just to ensure order
        }}
        css={handleStyles}
        onFocus={onFocusClick}
        onPointerDown={onFocusClick}
      >
        <EuiSplitPanel.Outer
          grow={true}
          hasBorder={true}
          css={{
            height: 'inherit',
            width: 'inherit',
            fontSize: style.fontSize,
            fontFamily: style.fontFamily,
            color: style.foregroundColor,
            backgroundColor: style.backgroundColor,
          }}
        >
          <EuiSplitPanel.Inner grow={false} color="subdued" paddingSize="none">
            <EuiFlexGroup
              responsive={false}
              alignItems="center"
              justifyContent="flexStart"
              gutterSize="none"
            >
              <EuiFlexItem grow={true}>
                <EuiFlexGroup
                  ref={dragHandleRef}
                  responsive={false}
                  alignItems="center"
                  justifyContent="flexStart"
                  gutterSize="none"
                  className="drag-handle"
                  {...getMouseGestureDragBindings()}
                >
                  <EuiFlexItem grow={false}>
                    <EuiIcon type="grabOmnidirectional" />
                  </EuiFlexItem>
                  <EuiFlexItem grow={true}>
                    <EuiText size="xs">{itemTitle}</EuiText>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFlexGroup
                  responsive={false}
                  alignItems="center"
                  justifyContent="flexEnd"
                >
                  <EuiButtonIcon
                    aria-label="Close"
                    title="Close"
                    iconType="cross"
                    color="accent"
                    size="xs"
                    onClick={onCloseClick}
                  />
                </EuiFlexGroup>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiSplitPanel.Inner>
          <EuiSpacer size="xs" />
          <EuiSplitPanel.Inner
            grow={true}
            paddingSize="none"
            className="eui-yScroll"
            css={{
              whiteSpace: 'pre-wrap',
            }}
          >
            <EuiFlexGroup
              responsive={false}
              alignItems="center"
              justifyContent="flexStart"
              gutterSize="none"
            >
              <EuiFlexItem grow={true}>{children}</EuiFlexItem>
              <EuiFlexItem grow={false}>
                <div
                  ref={resizeHandleRef}
                  className="resize-handle"
                  {...getMouseGestureDragBindings()}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiSplitPanel.Inner>
        </EuiSplitPanel.Outer>
      </animated.div>
    );
  }
);

GridItem.displayName = 'GridItem';
