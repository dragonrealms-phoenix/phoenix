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
import { useWindowDimensions } from '../../hooks/window-dimensions';
import { LocalStorage } from '../../lib/local-storage';
import { GridItem } from '../grid-item';

export interface GridItemProps {
  itemId: string;
  title: string;
  content: ReactNode;
}

export interface GridProps {
  items: Array<GridItemProps>;
}

export const Grid: React.FC<GridProps> = (props: GridProps): ReactNode => {
  const { items } = props;

  const { euiTheme } = useEuiTheme();

  const windowDimensions = useWindowDimensions();

  const [gridLayoutStyles, setGridLayoutStyles] = useState<SerializedStyles>();

  useEffect(() => {
    setGridLayoutStyles(css`
      ${css({
        height: windowDimensions.height,
        width: windowDimensions.width,
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
  }, [windowDimensions, euiTheme]);

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
    const { height, width } = windowDimensions;
    if (height) {
      setGridMaxRows(Math.floor(height / gridRowHeightWithMargin));
    }
    if (width) {
      setGridMaxWidth(width);
    }
  }, [windowDimensions, gridRowHeightWithMargin]);

  /**
   * Load the layout from storage or build a default layout.
   */
  const buildDefaultLayout = (): Array<Layout> => {
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
  };

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
   * Originally I called `useRef` in the grid item's `useMemo` hook below but
   * that caused "Error: Rendered fewer hooks than expected" to be thrown.
   * I later learned the "Rule of Hooks" which forbid what I was doing.
   * Found a workaround on stackoverflow to store the refs in a ref. Ironic.
   * https://react.dev/warnings/invalid-hook-call-warning
   * https://stackoverflow.com/questions/65350114/useref-for-element-in-loop-in-react/65350394#65350394
   */
  const itemRefs = useRef<Array<RefObject<HTMLDivElement>>>([]);
  itemRefs.current = layout.map((_layoutItem, index) => {
    // Note we use `createRef` and not `useRef` per "Rule of Hooks" for loops.
    return itemRefs.current[index] ?? createRef<HTMLDivElement>();
  });

  /**
   * To improve performance, we memoize the children so that they don't
   * change between rerenders. And if the children don't change then the
   * components within the layout won't rerender either.
   * https://github.com/react-grid-layout/react-grid-layout?tab=readme-ov-file#performance
   */
  const gridItems = useMemo(() => {
    return layout.map((layoutItem, index) => {
      const item = items.find((item) => item.itemId === layoutItem.i);
      const itemRef = itemRefs.current[index];
      return (
        <GridItem
          ref={itemRef}
          key={item!.itemId} // assuming the item will always be found
          itemId={item!.itemId} // will come back to haunt me
          titleBarText={item!.title} // I just don't know when or why
          onClose={onGridItemClose}
        >
          {item!.content}
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
