import { EuiText, useEuiTheme } from '@elastic/eui';
import { css } from '@emotion/react';
import Head from 'next/head';
import { useMemo, useRef, useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { GridItem } from '../grid-item';

const Grid: React.FC = (): JSX.Element => {
  const { euiTheme } = useEuiTheme();

  const gridLayoutStyles = css`
    .react-grid-item.react-grid-placeholder {
      background: ${euiTheme.colors.warning};
    }
    .react-grid-item .grab-handle {
      cursor: grab;
    }
    .react-grid-item .grab-handle:active {
      cursor: grabbing;
    }
  `;

  const gridItemTextStyles = css`
    font-family: ${euiTheme.font.familyCode};
    font-size: ${euiTheme.size.m};
    line-height: 'initial';
    color: ${euiTheme.colors.emptyShade};
    background: ${euiTheme.colors.darkestShade};
  `;

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
   * Define the initial layout state.
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
  const [layout, setLayout] = useState([
    { i: 'a', x: 0, y: 0, w: 3, h: 2, title: 'Room' },
    { i: 'b', x: 3, y: 0, w: 3, h: 2, title: 'Spells' },
    { i: 'c', x: 6, y: 0, w: 3, h: 2, title: 'Combat' },
  ]);

  /**
   * To improve performance, we memoize the children prop so that it doesn't
   * change between rerenders. And if the children don't change then the
   * components within the layout won't rerender either.
   * https://github.com/react-grid-layout/react-grid-layout?tab=readme-ov-file#performance
   */
  const children = useMemo(() => {
    return layout.map((item) => {
      return (
        <GridItem key={item.i} ref={useRef(null)}>
          <EuiText css={gridItemTextStyles}>Hello World</EuiText>
        </GridItem>
      );
    });
  }, [layout.length]);

  /**
   * When resize horizontally or vertically, this is the number
   * of pixels the grid item will grow or shrink.
   */
  const resizeIncrement = 30;

  return (
    <>
      <Head>
        <link rel="stylesheet" href={`/react-grid/layout.min.css`} />
        <link rel="stylesheet" href={`/react-grid/resizable.min.css`} />
      </Head>
      <ResponsiveGridLayout
        css={gridLayoutStyles}
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200 }}
        cols={{ lg: resizeIncrement }}
        rowHeight={resizeIncrement}
        isBounded={true}
        isDraggable={true}
        isDroppable={true}
        isResizable={true}
        resizeHandles={['se']}
        draggableHandle={'.grab-handle'}
      >
        {children}
      </ResponsiveGridLayout>
    </>
  );
};

export { Grid };
