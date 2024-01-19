import { useEuiTheme } from '@elastic/eui';
import type { SerializedStyles } from '@emotion/react';
import { css } from '@emotion/react';
import type { ReactNode, RefObject } from 'react';
import {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Layout } from 'react-grid-layout';
import GridLayout from 'react-grid-layout';
import { LocalStorage } from '../../lib/local-storage';
import { GridItem } from './grid-item';

export interface GridProps {
  dimensions: {
    height: number;
    width: number;
  };
  items: Array<{
    itemId: string;
    title: string;
    content: ReactNode;
  }>;
}

export const Grid: React.FC<GridProps> = (props: GridProps): ReactNode => {
  const { dimensions, items } = props;

  const { euiTheme } = useEuiTheme();

  const [gridLayoutStyles, setGridLayoutStyles] = useState<SerializedStyles>();

  useEffect(() => {
    setGridLayoutStyles(css`
      ${css({
        height: dimensions.height,
        width: dimensions.width,
      })}
      .react-grid-item.react-grid-placeholder {
        ${css({
          background: euiTheme.colors.warning,
        })}
      }
      .react-grid-item .grab-handle {
        ${css({
          cursor: 'grab',
        })}
      }
      .react-grid-item .grab-handle:active {
        ${css({
          cursor: 'grabbing',
        })}
      }
    `);
  }, [dimensions, euiTheme]);

  /**
   * When grid items are resized the increment is based on the the layout size.
   * Horizontal resize increments are based on the number of columns.
   * Vertical resize increments are based on row height.
   * Why two different units? I don't know.
   */

  /* Horizontal Resizing */

  // The grid layout is divided into columns.
  // The resize increment is the layout's width divided by the number of columns.
  // Use larger values to give users fine-grained control.
  // Use smaller values for coarse-grained control.
  const gridMaxColumns = 50;

  /* Vertical Resizing */

  // A grid item has a height, and if the layout has margins then there
  // is a number of pixels margin between each row, too. Therefore, the
  // total height of a grid item is the height plus the margin.
  // Playing around with different row heights, I deduced that the margin
  // size in pixels when the layout's margin is [1, 1] is ~1.03 pixels.
  const gridRowHeight = 10;
  const gridRowMargin = 1.03;
  const gridRowHeightWithMargin = gridRowHeight + gridRowMargin;

  /* Window Resizing */

  // As the window dimensions change, we need to update the layout, too,
  // so that the layout always fits the window exactly.
  // This allows the user to drag grid items anywhere within the window.
  const [gridMaxRows, setGridMaxRows] = useState<number>();
  const [gridMaxWidth, setGridMaxWidth] = useState<number>(1200); // app.ts

  useEffect(() => {
    const { height, width } = dimensions;
    if (height) {
      setGridMaxRows(Math.floor(height / gridRowHeightWithMargin));
    }
    if (width) {
      setGridMaxWidth(width);
    }
  }, [dimensions, gridRowHeightWithMargin]);

  /**
   * Load the layout from storage or build a default layout.
   */
  const buildDefaultLayout = useCallback((): Array<Layout> => {
    let layout = LocalStorage.get<Array<Layout>>('layout');

    if (layout) {
      // Discard any old layout items that are not in the grid's items list.
      layout = layout.filter((layoutItem) => {
        return items.find((item) => item.itemId === layoutItem.i);
      });
      return layout;
    }

    // We'll tile the items three per row.
    const maxItemsPerRow = 3;

    // The min width and height are used to prevent the grid item from being
    //resized so small that it's unusable and hides its title bar.
    const minWidth = 5;
    const minHeight = 2;

    // The number of columns and rows the item will span.
    const defaultWidth = Math.floor(gridMaxColumns / maxItemsPerRow);
    const defaultHeight = gridRowHeight;

    let rowOffset = 0;
    let colOffset = 0;

    layout = items.map((item, index): Layout => {
      // If time to move to next row then adjust the offsets.
      if (index > 0 && index % maxItemsPerRow === 0) {
        rowOffset += gridRowHeight;
        colOffset = 0;
      }

      const newItem = {
        i: item.itemId,
        x: defaultWidth * colOffset,
        y: rowOffset,
        w: defaultWidth,
        h: defaultHeight,
        minW: minWidth,
        minH: minHeight,
      };

      colOffset += 1;

      return newItem;
    });

    return layout;
  }, [items]);

  const [layout, setLayout] = useState<Array<Layout>>(buildDefaultLayout);

  // Save the layout when it changes in the grid.
  const onLayoutChange = useCallback((newLayout: Array<Layout>) => {
    setLayout(newLayout);
    LocalStorage.set('layout', newLayout);
  }, []);

  // Remove the item from the layout then save the layout.
  const onGridItemClose = useCallback((itemId: string) => {
    setLayout((oldLayout) => {
      const newLayout = oldLayout.filter((layoutItem) => {
        return layoutItem.i !== itemId;
      });
      LocalStorage.set('layout', newLayout);
      return newLayout;
    });
  }, []);

  /**
   * How to use custom components as react-grid-layout children.
   * https://github.com/react-grid-layout/react-grid-layout/tree/master?tab=readme-ov-file#custom-child-components-and-draggable-handles
   * https://stackoverflow.com/questions/67053157/react-grid-layout-error-draggablecore-not-mounted-on-dragstart
   */
  const itemRefsMap = useRef<Map<string, RefObject<HTMLDivElement>>>(new Map());

  // This section builds a stable map of refs for each grid item element.
  itemRefsMap.current = useMemo(() => {
    const oldMap = itemRefsMap.current;
    const newMap = new Map<string, RefObject<HTMLDivElement>>();

    // When the layout changes, reuse a ref if it already exists.
    // When the layout grows, we create new refs for the new items.
    layout.forEach((layoutItem) => {
      const oldRef = oldMap.get(layoutItem.i);
      const newRef = oldRef ?? createRef<HTMLDivElement>();
      newMap.set(layoutItem.i, newRef);
    });

    return newMap;

    // For performance, I only want to recalculate the children
    // if the number of items in the layout changes. No other reason.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout.length]);

  /**
   * To improve performance, we memoize the children so that they don't
   * change between rerenders. And if the children don't change then the
   * components within the layout won't rerender either.
   * https://github.com/react-grid-layout/react-grid-layout?tab=readme-ov-file#performance
   */
  const gridItems = useMemo(() => {
    return layout.map((layoutItem) => {
      // Assuming the item will always be found will come back to haunt me.
      // I just don't know when or why.
      const item = items.find((item) => item.itemId === layoutItem.i)!;
      const itemRef = itemRefsMap.current.get(layoutItem.i)!;
      return (
        <GridItem
          ref={itemRef}
          key={item.itemId}
          itemId={item.itemId}
          titleBarText={item.title}
          onClose={onGridItemClose}
        >
          {item.content}
        </GridItem>
      );
    });
    // For performance, I only want to recalculate the children
    // if the number of items in the layout changes. No other reason.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout.length]);

  return (
    <GridLayout
      css={gridLayoutStyles}
      layout={layout}
      cols={gridMaxColumns}
      width={gridMaxWidth}
      rowHeight={gridRowHeight}
      maxRows={gridMaxRows}
      // Disable the grid from managing its own height.
      // We manage it explicitly in the `gridLayoutStyles` above.
      autoSize={false}
      // Provide nominal spacing between grid items.
      // If this value changes then review the grid row height variables.
      margin={[1, 1]}
      // Handle each time the layout changes (e.g. an item is moved or resized)
      onLayoutChange={onLayoutChange}
      // Allow items to be placed anywhere in the grid.
      compactType={null}
      // Prevent items from overlapping or being pushed.
      preventCollision={true}
      // Prevent items from being dragged outside the grid.
      isBounded={true}
      // Allow items to be dragged around the grid.
      isDraggable={true}
      // Allow items to be dropped around the grid.
      isDroppable={true}
      // Allow items to be resized within the grid.
      isResizable={true}
      // The grid item's bottom right corner is used as the handle for resizing.
      resizeHandles={['se']}
      // The grid item's title bar is used as the handle for dragging.
      draggableHandle={'.grab-handle'}
    >
      {gridItems}
    </GridLayout>
  );
};

Grid.displayName = 'Grid';
