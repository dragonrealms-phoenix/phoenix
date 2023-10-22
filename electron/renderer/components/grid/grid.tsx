import {
  EuiPanel,
  EuiText,
  useEuiOverflowScroll,
  useEuiTheme,
} from '@elastic/eui';
import { cx } from '@emotion/css';
import { css } from '@emotion/react';
import Head from 'next/head';
import {
  CSSProperties,
  MouseEvent,
  ReactNode,
  TouchEvent,
  forwardRef,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useLogger } from '../logger';

const Grid: React.FC = (): JSX.Element => {
  const { logger } = useLogger('component:grid');

  logger.info('rendering');

  const { euiTheme } = useEuiTheme();

  const gridLayoutStyles = css`
    .react-grid-layout {
      background: ${euiTheme.colors.lightestShade};
    }
    .react-grid-item {
      padding: ${euiTheme.size.xs};
    }
    .react-grid-item.react-grid-placeholder {
      background: ${euiTheme.colors.warning};
    }
  `;

  const gridItemTextStyles = css`
    font-family: ${euiTheme.font.familyCode};
    white-space: pre-wrap;
    ${useEuiOverflowScroll('y', true)}
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
   */
  const [layout, setLayout] = useState([
    { i: 'a', x: 0, y: 0, w: 3, h: 2 },
    { i: 'b', x: 3, y: 0, w: 3, h: 2 },
    { i: 'c', x: 6, y: 0, w: 3, h: 2 },
  ]);

  /**
   * To improve performance, we memoize the children prop so that it doesn't
   * change between rerenders. And if the children don't change then the
   * components within the layout won't rerender either.
   * https://github.com/react-grid-layout/react-grid-layout?tab=readme-ov-file#performance
   */
  const children = useMemo(() => {
    return layout.map((item) => {
      /**
       * How to use custom components a react-grid-layout children.
       * https://github.com/react-grid-layout/react-grid-layout/tree/master?tab=readme-ov-file#custom-child-components-and-draggable-handles
       * https://stackoverflow.com/questions/67053157/react-grid-layout-error-draggablecore-not-mounted-on-dragstart
       */

      interface ReactGridLayoutItemProps {
        style?: CSSProperties;
        className?: string;
        onMouseDown?: (e: MouseEvent<HTMLDivElement>) => void;
        onMouseUp?: (e: MouseEvent<HTMLDivElement>) => void;
        onTouchEnd?: (e: TouchEvent<HTMLDivElement>) => void;
        children?: ReactNode;
      }

      const MyGridItem = forwardRef<HTMLDivElement, ReactGridLayoutItemProps>(
        (props, ref) => {
          const { style, className, children, ...otherProps } = props;

          return (
            <EuiPanel
              panelRef={ref}
              hasBorder={true}
              grow={false}
              style={style}
              className={cx(className)}
              {...otherProps}
            >
              <EuiText css={gridItemTextStyles}>{item.i}</EuiText>
              {children}
            </EuiPanel>
          );
        }
      );

      MyGridItem.displayName = 'MyGridItem';

      return <MyGridItem key={item.i} ref={useRef(null)} />;
    });
  }, [layout.length]);

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
        cols={{ lg: 30 }}
        rowHeight={30}
        isBounded={true}
        isDraggable={true}
        isDroppable={true}
        isResizable={true}
        resizeHandles={['se']}
      >
        {children}
      </ResponsiveGridLayout>
    </>
  );
};

export { Grid };
