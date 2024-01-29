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
// To me, the "layout" is the collection of grid items and their positions.
// To the react-grid-layout component, a "layout" is a single item's positions.
// To help with terminology, aliasing the type here, redefining it below.
import type { Layout as GridLayoutItem } from 'react-grid-layout';
import GridLayout from 'react-grid-layout';
import { useLogger } from '../../hooks/logger/index.js';
import { LocalStorage } from '../../lib/local-storage.js';
import type { GridItemProps } from './grid-item.js';
import { GridItem } from './grid-item.js';

// See comment above about terminology.
type Layout = Array<GridLayoutItem>;

export interface GridProps {
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
  /**
   * The items to display in the grid.
   */
  items: Array<{
    /**
     * The unique identifier for the grid item.
     */
    itemId: GridItemProps['itemId'];
    /**
     * Text to display in the title bar of the grid item.
     */
    title: GridItemProps['titleBarText'];
    /**
     * Content to show inside the grid item.
     */
    content: GridItemProps['children'];
  }>;
}

export const Grid: React.FC<GridProps> = (props: GridProps): ReactNode => {
  const { dimensions, items } = props;

  const { logger } = useLogger('grid');

  const { height, width } = dimensions;

  const { euiTheme } = useEuiTheme();

  const [gridLayoutStyles, setGridLayoutStyles] = useState<SerializedStyles>();

  useEffect(() => {
    setGridLayoutStyles(css`
      ${css({
        height,
        width,
        overflow: 'clip', // TODO fix so grid is y-scrollable without bleeding over/under outside elements
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
  }, [height, width, euiTheme]);

  /**
   * When grid items are resized the increment is based on the the layout size.
   * Horizontal resize increments are based on the number of columns.
   * Vertical resize increments are based on row height pixels.
   * Why two different units? I don't know.
   */

  /* Horizontal Resizing */

  // The grid layout is vertically divided into columns.
  // The resize increment is the layout's width divided by the number of columns.
  // Use larger values to give users fine-grained control.
  // Use smaller values for coarse-grained control.
  // Note, this value is number of columns, not pixels.
  const gridMaxColumns = 50;

  /* Vertical Resizing */

  // A grid item has a height, and if the layout has margins then there
  // is a number of pixels margin between each row, too. Therefore, the
  // total height of a grid item is the height plus the margin.
  // Playing around with different row heights, I deduced that the margin
  // size in pixels is ~1.03 pixels when the layout's margin is [1, 1].
  // Note, these values are in pixels.
  const gridRowHeightPx = 10;
  const gridRowMarginPx = 1.03;
  const gridRowHeightWithMarginPx = gridRowHeightPx + gridRowMarginPx;

  /* Window Resizing */

  // As the window dimensions change, we need to update the layout, too,
  // so that the layout always fits the window exactly.
  // This allows the user to drag grid items anywhere within the window.
  const [gridMaxRows, setGridMaxRows] = useState<number>(1);
  const [gridMaxWidthPx, setGridMaxWidth] = useState<number>(width);

  useEffect(() => {
    // Note, when first rendering the UI, the received dimensions may be <= 0.
    // Once things start to flesh out in the UI then true dimensions come in.
    // So only adjust the grid rows/cols if we received true dimensions.
    if (height <= 0 || width <= 0) {
      logger.debug('received invalid dimensions, not resizing grid', {
        height,
        width,
      });
      return;
    }

    const newMaxRows = Math.floor(height / gridRowHeightWithMarginPx);
    setGridMaxRows(newMaxRows);
    setGridMaxWidth(width);

    // When we reduce the grid max rows, iterate all the items
    // in the layout and scale their row/height values to fit.
    setGridMaxRows((oldMaxRows) => {
      logger.debug('*** gridMaxRows', {
        height,
        width,
        gridRowHeightWithMarginPx,
        oldMaxRows,
        newMaxRows,
      });
      //   if (oldMaxRows > newMaxRows) {
      //     setLayout((oldLayout) => {
      //       const newLayout = oldLayout.map((layoutItem) => {
      //         const newLayoutItem = {
      //           ...layoutItem,
      //           h: Math.max(
      //             3,
      //             Math.floor((newMaxRows / oldMaxRows) * layoutItem.h)
      //           ),
      //           y: Math.floor((newMaxRows / oldMaxRows) * layoutItem.y),
      //         };
      //         return newLayoutItem;
      //       });
      //       LocalStorage.set('layout', newLayout);
      //       return newLayout;
      //     });
      //     return newMaxRows;
      //   }
      return newMaxRows;
    });
  }, [logger, height, width, gridRowHeightWithMarginPx]);

  /**
   * Load the layout from storage or build a default layout.
   */
  const buildDefaultLayout = useCallback((): Layout => {
    let layout = LocalStorage.get<Layout>('layout');

    if (layout) {
      // Discard any old layout items that are not in the grid's items list.
      layout = layout.filter((layoutItem) => {
        return items.find((item) => item.itemId === layoutItem.i);
      });
      return layout;
    }

    // We'll tile the items three per row.
    const maxItemsPerRow = 3;

    // The min dimensions are used to prevent the grid item from being
    // resized so small that it's unusable and hides its title bar.
    // Note, these values are in row/col-spans, not pixels.
    const minCols = 5;
    const minRows = 3;

    // The default dimensions each item will span by default.
    // Note, these values are in row/col-spans, not pixels.
    const defaultCols = Math.floor(gridMaxColumns / maxItemsPerRow);
    const defaultRows = 10;

    // The row offset is the number of pixels (y-index, height)
    // to offset the item from the top of the grid. We increase this
    // each time we begin a new row.
    // I don't know why react-grid-layout uses pixels for the y-index
    // and column spans for the x-index. It's weird.
    let rowOffset = 0;

    // The column offset is a simple counter (i.e. 1..2..3..)
    // that when multiplied by the default column width of an item gives us
    // which column to the right the next item should be placed.
    // Again, I don't know why react-grid-layout uses pixels for the y-index
    // and column spans for the x-index. It's weird.
    let colOffset = 0;

    layout = items.map((item, index): GridLayoutItem => {
      // If time to move to next row then adjust the offsets.
      if (index > 0 && index % maxItemsPerRow === 0) {
        // Only increase the offset by an item's row height (without margin)
        // The grid will automatically apply the margin when rendering.
        rowOffset += gridRowHeightPx;
        // Reset the column offset to the first column.
        colOffset = 0;
      }

      const newItem: GridLayoutItem = {
        i: item.itemId, // unique identifier for the grid item
        x: defaultCols * colOffset, // which column to start at, not pixels
        y: rowOffset, // pixels (row # x row height px without margin)
        w: defaultCols, // column spans
        h: defaultRows, // row spans
        minW: minCols, // column spans
        minH: minRows, // row spans
      };

      colOffset += 1;

      return newItem;
    });

    return layout;
  }, [items]);

  const [layout, setLayout] = useState<Layout>(buildDefaultLayout);

  // Save the layout when it changes in the grid.
  const onLayoutChange = useCallback((newLayout: Layout) => {
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
      width={gridMaxWidthPx}
      rowHeight={gridRowHeightPx}
      maxRows={gridMaxRows}
      // Disable the grid from managing its own height.
      // This component does a great job scaling width, but not height.
      // We manage height explicitly to scale items to fit the window.
      // The default behavior (true) shrinks the grid's height potential
      // based on the afforded height of its parent container but doesn't
      // actually scale the height of the grid items themselves.
      // This causes the grid items to overflow their containers, ugh.
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
      // Prevent items from being dragged over each other.
      allowOverlap={false}
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
