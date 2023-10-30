import { EuiText, useEuiTheme } from '@elastic/eui';
import { SerializedStyles, css } from '@emotion/react';
import { Ref, createRef, useEffect, useMemo, useRef, useState } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import { useWindowDimensions } from '../../hooks/window-dimensions';
import { GridItem } from '../grid-item';

const Grid: React.FC = (): JSX.Element => {
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
  }, [windowDimensions]);

  const gridItemTextStyles = css({
    fontFamily: euiTheme.font.familyCode,
    fontSize: euiTheme.size.m,
    lineHeight: 'initial',
    paddingLeft: euiTheme.size.s,
    paddingRight: euiTheme.size.s,
  });

  /**
   * Define the initial layout state.
   *
   * The min width and height are used to prevent the grid item from being
   * resized so small that it's unusable and hides its title bar.
   *
   * TODO move the definition of the layout to a separate file
   *      and pass this in as a grid prop
   * TODO load the layout from storage
   * TODO create an item per game window that is open (e.g. Room, Spells, etc)
   *      and one of the properties should be the game window's title
   *      and one of the properties should be the game window's text
   *      Probably make the property another component to encapsulate use of rxjs
   *      and then exposes a property that is the text so that when that changes
   *      then the grid item will rerender.
   */
  type MyLayout = Array<Layout & { [key: string]: any }>;
  const defaultLayout: MyLayout = [
    {
      i: 'a',
      x: 0,
      y: 0,
      w: 5,
      minW: 5,
      h: 10,
      minH: 2,
      // TODO the title and content should come from another variable
      //      the coordinates should be part of a layout that gets saved/loaded
      //      and the cross-ref between the two should be the key (`i` prop)
      //      This is because the react nodes are not serializable.
      title: 'Room',
      content: <EuiText css={gridItemTextStyles}>room room room</EuiText>,
    },
    {
      i: 'b',
      x: 5,
      y: 5,
      w: 5,
      minW: 5,
      h: 10,
      minH: 2,
      title: 'Spells',
      content: <EuiText css={gridItemTextStyles}>spells spells spells</EuiText>,
    },
    {
      i: 'c',
      x: 10,
      y: 10,
      w: 5,
      minW: 5,
      h: 10,
      minH: 2,
      title: 'Combat',
      content: <EuiText css={gridItemTextStyles}>combat combat combat</EuiText>,
    },
  ];

  const [layout, setLayout] = useState<MyLayout>(defaultLayout);

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
  }, [windowDimensions]);

  /**
   * Originally I called `useRef` in the children's `useMemo` hook below but
   * that caused "Error: Rendered fewer hooks than expected" to be thrown.
   * I later learned the "Rule of Hooks" which forbid what I was doing.
   * Found a workaround on stackoverflow to store the refs in a ref. Ironic.
   * https://react.dev/warnings/invalid-hook-call-warning
   * https://stackoverflow.com/questions/65350114/useref-for-element-in-loop-in-react/65350394#65350394
   */
  const childRefs = useRef<Array<Ref<HTMLDivElement>>>([]);
  childRefs.current = layout.map((_item, i) => {
    // Note we use `createRef` and not `useRef` per "Rule of Hooks"
    return childRefs.current[i] ?? createRef<HTMLDivElement>();
  });

  /**
   * To improve performance, we memoize the children so that they don't
   * change between rerenders. And if the children don't change then the
   * components within the layout won't rerender either.
   * https://github.com/react-grid-layout/react-grid-layout?tab=readme-ov-file#performance
   */
  const children = useMemo(() => {
    return layout.map((item, i) => {
      return (
        <GridItem
          key={item.i}
          ref={childRefs.current[i]}
          titleBarText={item.title}
        >
          {item.content}
        </GridItem>
      );
    });
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
      onLayoutChange={(layout) => {
        // TODO save the layout to storage
        setLayout(layout);
      }}
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
      {children}
    </GridLayout>
  );
};

export { Grid };
