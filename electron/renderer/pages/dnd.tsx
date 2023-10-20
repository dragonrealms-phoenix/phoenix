import Head from 'next/head';
import { useMemo, useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useLogger } from '../components/logger';

const DragDropPage: React.FC = (): JSX.Element => {
  const { logger } = useLogger('page:dnd');

  logger.info('rendering');

  // https://github.com/react-grid-layout/react-grid-layout?tab=readme-ov-file#react-hooks-performance
  const ResponsiveGridLayout = useMemo(() => {
    return WidthProvider(Responsive);
  }, []);

  const [layout, setLayout] = useState([
    { i: 'a', x: 0, y: 0, w: 1, h: 2, static: true },
    { i: 'b', x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4 },
    { i: 'c', x: 4, y: 0, w: 1, h: 2 },
  ]);

  // https://github.com/react-grid-layout/react-grid-layout?tab=readme-ov-file#performance
  const children = useMemo(() => {
    logger.debug('generating children');
    return layout.map((item) => <div key={item.i}>{item.i}</div>);
  }, [layout.length]);

  return (
    <>
      <Head>
        <link rel="stylesheet" href={`/react-grid/layout.min.css`} />
        <link rel="stylesheet" href={`/react-grid/resizable.min.css`} />
        <style>
          {`
            body {
              padding: 20px;
            }
            #content {
              width: 100%;
            }
            .react-grid-layout {
              background: #eee;
              margin-top: 10px;
            }
            .layoutJSON {
              background: #ddd;
              border: 1px solid black;
              margin-top: 10px;
              padding: 10px;
            }
            .columns {
              -moz-columns: 120px;
              -webkit-columns: 120px;
              columns: 120px;
            }
            .react-grid-item {
              box-sizing: border-box;
            }
            .react-grid-item:not(.react-grid-placeholder) {
              background: #ccc;
              border: 1px solid black;
            }
            .react-grid-item.resizing {
              opacity: 0.9;
            }
            .react-grid-item.static {
              background: #cce;
            }
            .react-grid-item .text {
              font-size: 24px;
              text-align: center;
              position: absolute;
              top: 0;
              bottom: 0;
              left: 0;
              right: 0;
              margin: auto;
              height: 24px;
            }
            .react-grid-item .minMax {
              font-size: 12px;
            }
            .react-grid-item .add {
              cursor: pointer;
            }
            .react-grid-dragHandleExample {
              cursor: move; /* fallback if grab cursor is unsupported */
              cursor: grab;
              cursor: -moz-grab;
              cursor: -webkit-grab;
            }
            .toolbox {
              background-color: #dfd;
              width: 100%;
              height: 120px;
              overflow: scroll;
            }
            .hide-button {
              cursor: pointer;
              position: absolute;
              font-size: 20px;
              top: 0px;
              right: 5px;
            }
            .toolbox__title {
              font-size: 24px;
              margin-bottom: 5px;
            }
            .toolbox__items {
              display: block;
            }
            .toolbox__items__item {
              display: inline-block;
              text-align: center;
              line-height: 40px;
              cursor: pointer;
              width: 40px;
              height: 40px;
              padding: 10px;
              margin: 5px;
              border: 1px solid black;
              background-color: #ddd;
            }
            .droppable-element {
              width: 150px;
              text-align: center;
              background: #fdd;
              border: 1px solid black;
              margin: 10px 0;
              padding: 10px;
            }
          `}
        </style>
      </Head>
      <div id="doug">Hello World</div>
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200 }}
        cols={{ lg: 12 }}
        isBounded={true}
        isDraggable={true}
        isDroppable={true}
        isResizable={true}
        resizeHandles={['nw', 'ne', 'se', 'sw']}
      >
        {children}
      </ResponsiveGridLayout>
    </>
  );
};

export default DragDropPage;
