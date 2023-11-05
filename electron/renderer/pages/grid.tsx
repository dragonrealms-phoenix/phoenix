import dynamic from 'next/dynamic';
import {
  ReactNode,
  createElement,
  isValidElement,
  useEffect,
  useState,
} from 'react';
import { Observable, interval, map, take } from 'rxjs';
import { Grid } from '../components/grid';
import { useLogger } from '../components/logger';

// The grid dynamically modifies the DOM, so we can't use SSR
// because the server and client DOMs will be out of sync.
// https://nextjs.org/docs/messages/react-hydration-error
const GridNoSSR = dynamic(async () => Grid, { ssr: false });

interface DougProps {
  stream$: Observable<ReactNode>;
}

const DougCmp: React.FC<DougProps> = (props: DougProps): ReactNode => {
  const { stream$ } = props;

  const [lines, setLines] = useState<Array<string>>([]);

  useEffect(() => {
    console.log('subscribing to stream');
    const subscription = stream$.subscribe((element) => {
      if (element) {
        if (isValidElement(element)) {
          setLines((lines) => [...lines, element.props.children]);
        }
      }
    });

    return () => {
      console.log('unmounting');
      subscription.unsubscribe();
    };
  }, [stream$]);

  const output = lines.map((line, index) => {
    return <p key={index}>{line}</p>;
  });
  console.log('rendering lines', { output });

  return <div>{output}</div>;
};

const GridPage: React.FC = (): ReactNode => {
  const { logger } = useLogger('page:grid');

  // TODO get a filtered game-stream of only <pushStream> tags
  // TODO load grid layout from storage (the 'i' property is the key)
  // TODO load game-window key values from storage (e.g. { id: 'percWindow', label: 'Spells' })
  //      a lot of these we know, but DR may introduce others in the future
  //      so there will be our default data plus user-defined data

  const gamePushStream$ = interval(1000).pipe(
    take(10),
    map((i) => {
      if (i % 2 === 0) {
        return createElement(
          'pushStream',
          { id: 'room' },
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vitae elit libero, a pharetra augue.'
        );
      }
      return createElement(
        'pushStream',
        { id: 'percWindow' },
        'Ethereal Shield (5 roisean)'
      );
    })
  );

  return (
    <GridNoSSR
      items={[
        {
          itemId: 'room',
          title: 'Room',
          // content: <DougCmp stream$={gamePushStream$} />,
          content: <div>empty</div>,
        },
        {
          itemId: 'percWindow',
          title: 'Spells',
          // content: <DougCmp stream$={gamePushStream$} />,
          content: <div>empty</div>,
        },
        {
          itemId: 'inv',
          title: 'Inventory',
          // content: <DougCmp stream$={gamePushStream$} />,
          content: <div>empty</div>,
        },
        {
          itemId: 'familiar',
          title: 'Familiar',
          // content: <DougCmp stream$={gamePushStream$} />,
          content: <div>empty</div>,
        },
        {
          itemId: 'thoughts',
          title: 'Thoughts',
          // content: <DougCmp stream$={gamePushStream$} />,
          content: <div>empty</div>,
        },
        {
          itemId: 'combat',
          title: 'Combat',
          // content: <DougCmp stream$={gamePushStream$} />,
          content: <div>empty</div>,
        },
        {
          itemId: 'main',
          title: 'Main',
          // content: <DougCmp stream$={gamePushStream$} />,
          content: <div>empty</div>,
        },
      ]}
    />
  );
};

export default GridPage;
