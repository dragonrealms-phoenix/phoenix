import { EuiPanel } from '@elastic/eui';
import {
  CSSProperties,
  MouseEvent,
  ReactNode,
  Ref,
  TouchEvent,
  forwardRef,
} from 'react';

interface GridItemProps {
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
 * How to use custom components as react-grid-layout children.
 * https://github.com/react-grid-layout/react-grid-layout/tree/master?tab=readme-ov-file#custom-child-components-and-draggable-handles
 * https://stackoverflow.com/questions/67053157/react-grid-layout-error-draggablecore-not-mounted-on-dragstart
 */
const GridItem: React.FC<GridItemProps> = forwardRef<
  HTMLDivElement,
  GridItemProps
>((props, ref): JSX.Element => {
  const { style, className, children, ...otherProps } = props;

  return (
    <EuiPanel
      panelRef={ref}
      hasBorder={true}
      grow={false}
      style={style}
      className={className}
      {...otherProps}
    >
      {children}
    </EuiPanel>
  );
});

GridItem.displayName = 'GridItem';

export { GridItem };
