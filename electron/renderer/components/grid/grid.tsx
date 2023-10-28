import { EuiText, useEuiTheme } from '@elastic/eui';
import { css } from '@emotion/react';
import { Ref, createRef, useEffect, useMemo, useRef, useState } from 'react';
import { Layout, Responsive, WidthProvider } from 'react-grid-layout';
import { GridItem } from '../grid-item';
import { useLogger } from '../logger';

const Grid: React.FC = (): JSX.Element => {
  const { logger } = useLogger('component:grid');

  const { euiTheme } = useEuiTheme();

  const [gridLayoutStyles, setGridLayoutStyles] = useState(css``);

  useEffect(() => {
    setGridLayoutStyles(css`
      ${css({
        height: window.innerHeight,
        minHeight: window.innerHeight,
        maxHeight: window.innerHeight,
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
  }, [window?.innerHeight]);

  const gridItemTextStyles = css({
    fontFamily: euiTheme.font.familyCode,
    fontSize: euiTheme.size.m,
    lineHeight: 'initial',
    paddingLeft: euiTheme.size.s,
    paddingRight: euiTheme.size.s,
  });

  /**
   * Using hooks to save the layout state on change will cause the layouts to
   * re-render because the layout component's value keeps changing every render.
   * To avoid this we memoize the layout component using the `useMemo` hook.
   * https://github.com/react-grid-layout/react-grid-layout?tab=readme-ov-file#react-hooks-performance
   */
  const ResponsiveGridLayout = useMemo(() => {
    return WidthProvider(Responsive);
  }, []);

  /**
   * When resize horizontally or vertically, this is the number
   * of pixels the grid item will grow or shrink per increment.
   * Use smaller numbers to give users more granular and precise control.
   * Use larger numbers to give users more coarse and quick control.
   */
  const resizeMaxColumns = 50; // increment = divide page width by this value
  const resizeRowHeightIncrement = 10; // approx. pixels to change vertically
  const gridItemMargin = 1.03; // pixels, when grid layout margin is [1, 1]
  const rowHeightWithMargin = resizeRowHeightIncrement + gridItemMargin;

  const [gridMaxRows, setGridMaxRows] = useState<number>(10);

  // Recalculate the max grid layout height when the window is resized.
  // This lets the user drag the grid items around the whole window.
  // https://stackoverflow.com/questions/36862334/get-viewport-window-height-in-reactjs
  useEffect(() => {
    const onWindowResize = () => {
      setGridMaxRows(Math.floor(window.innerHeight / rowHeightWithMargin));
    };
    window.addEventListener('resize', onWindowResize);
    return () => {
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);

  /**
   * Define the initial layout state.
   *
   * The min width and height are used to prevent the grid item from being
   * resized so small that it's unusable and hides its title bar.
   *
   * TODO save the layout on changes
   * TODO load the layout according to user's preferences
   * TODO create an item per game window that is open (e.g. Room, Spells, etc)
   *      and one of the properties should be the game window's title
   *      and one of the properties should be the game window's text
   *      Probably make the property another component to encapsulate use of rxjs
   *      and then exposes a property that is the text so that when that changes
   *      then the grid item will rerender.
   */
  const [layout, setLayout] = useState<Array<Layout & { [key: string]: any }>>([
    { i: 'a', x: 0, y: 0, w: 4, minW: 5, h: 10, minH: 2, title: 'Room' },
    { i: 'b', x: 4, y: 0, w: 5, minW: 5, h: 10, minH: 2, title: 'Spells' },
    { i: 'c', x: 9, y: 0, w: 6, minW: 5, h: 10, minH: 2, title: 'Combat' },
  ]);

  const lastLayoutThatRespectsMaxHeight = useRef<Array<Layout>>([]);

  /**
   * Originally I called `useRef` in the `children` `useMemo` hook below but
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
    logger.info('creating children');
    return layout.map((item, i) => {
      return (
        <GridItem
          key={item.i}
          ref={childRefs.current[i]}
          titleBarText={item.title}
        >
          <EuiText css={gridItemTextStyles}>Hello World</EuiText>
        </GridItem>
      );
    });
  }, [layout.length]);

  return (
    <ResponsiveGridLayout
      css={gridLayoutStyles}
      layouts={{ lg: layout }}
      breakpoints={{ lg: 1200 }}
      cols={{ lg: resizeMaxColumns }}
      rowHeight={resizeRowHeightIncrement}
      maxRows={gridMaxRows}
      autoSize={false}
      margin={[1, 1]}
      onLayoutChange={(layout) => {
        // const isTooTall = layout.some((item) => {
        //   return false;
        // });
      }}
      onDragStart={(layout) => {
        lastLayoutThatRespectsMaxHeight.current = layout;
      }}
      onResizeStart={(layout) => {
        lastLayoutThatRespectsMaxHeight.current = layout;
      }}
      compactType={null}
      isBounded={true}
      isDraggable={true}
      isDroppable={true}
      isResizable={true}
      resizeHandles={['se']}
      draggableHandle={'.grab-handle'}
    >
      {children}
    </ResponsiveGridLayout>
  );
};

export { Grid };
