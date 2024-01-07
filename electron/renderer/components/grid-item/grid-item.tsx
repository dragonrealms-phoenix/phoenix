import {
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiSpacer,
  EuiSplitPanel,
  EuiText,
  useEuiOverflowScroll,
} from '@elastic/eui';
import { css } from '@emotion/react';
import type {
  CSSProperties,
  MouseEvent,
  ReactNode,
  Ref,
  TouchEvent,
} from 'react';
import { forwardRef, useCallback } from 'react';

export interface GridItemProps {
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
   * Required when using custom components as react-grid-layout children.
   */
  ref: Ref<HTMLDivElement>;
  /**
   * This property is passed to the item from the grid layout.
   * You must assign it to the same prop of the root element of the grid item.
   */
  style?: CSSProperties;
  /**
   * This property is passed to the item from the grid layout.
   * You must assign it to the same prop of the root element of the grid item.
   */
  className?: string;
  /**
   * This property is passed to the item from the grid layout.
   * You must assign it to the same prop of the root element of the grid item.
   */
  onMouseDown?: (e: MouseEvent<HTMLDivElement>) => void;
  /**
   * This property is passed to the item from the grid layout.
   * You must assign it to the same prop of the root element of the grid item.
   */
  onMouseUp?: (e: MouseEvent<HTMLDivElement>) => void;
  /**
   * This property is passed to the item from the grid layout.
   * You must assign it to the same prop of the root element of the grid item.
   */
  onTouchEnd?: (e: TouchEvent<HTMLDivElement>) => void;
  /**
   * This property contains any children nested within the grid item
   * when you're constructing the grid layout.
   * You must nest it within the root element of the grid item.
   */
  children?: ReactNode;
}

/**
 * The grid layout pushes resizable handles as children of the grid item.
 * When the scrollbar for the content is displayed then it creates a
 * barrier between the right-most edge of the grid item and its content.
 * Yet the resizable handles are still visible on the grid item's edge
 * just not clickable in that position, it's now offset by the scrollbar.
 * To mitigate this adjustment, we move the resizable handles to the the
 * outside of the scrollable content.
 */
function separateResizeHandleComponents(nodes: ReactNode): {
  children: Array<ReactNode>;
  resizeHandles: Array<ReactNode>;
} {
  const children = [];
  const resizeHandles = [];

  if (Array.isArray(nodes)) {
    for (const child of nodes) {
      if (child) {
        if (child.key?.startsWith('resizableHandle-')) {
          resizeHandles.push(child);
        } else {
          children.push(child);
        }
      }
    }
  } else if (nodes) {
    children.push(nodes);
  }

  return {
    resizeHandles,
    children,
  };
}

/**
 * How to use custom components as react-grid-layout children.
 * https://github.com/react-grid-layout/react-grid-layout/tree/master?tab=readme-ov-file#custom-child-components-and-draggable-handles
 * https://stackoverflow.com/questions/67053157/react-grid-layout-error-draggablecore-not-mounted-on-dragstart
 */
export const GridItem: React.FC<GridItemProps> = forwardRef<
  HTMLDivElement,
  GridItemProps
>((props, ref): ReactNode => {
  const {
    itemId,
    titleBarText,
    onClose,
    style,
    className,
    children,
    ...otherProps
  } = props;

  const gridItemContentStyles = css`
    white-space: pre-wrap;
    ${useEuiOverflowScroll('y', false)}
  `;

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

  const { resizeHandles, children: gridItemChildren } =
    separateResizeHandleComponents(children);

  return (
    <EuiSplitPanel.Outer
      panelRef={ref}
      grow={false}
      hasBorder={true}
      style={style}
      className={className}
      {...otherProps}
    >
      <EuiSplitPanel.Inner grow={false} color="subdued" paddingSize="none">
        <EuiFlexGroup
          responsive={false}
          alignItems="center"
          justifyContent="flexStart"
          gutterSize="none"
        >
          <EuiFlexItem grow={1} className={'grab-handle'}>
            <EuiIcon type="grabOmnidirectional" />
          </EuiFlexItem>
          <EuiFlexItem grow={true} className={'grab-handle'}>
            <EuiText size="xs">{titleBarText}</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup
              responsive={false}
              alignItems="center"
              justifyContent="flexEnd"
            >
              <EuiButtonIcon
                aria-label="Close"
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
        css={gridItemContentStyles}
      >
        {gridItemChildren}
      </EuiSplitPanel.Inner>
      {resizeHandles}
    </EuiSplitPanel.Outer>
  );
});

GridItem.displayName = 'GridItem';
