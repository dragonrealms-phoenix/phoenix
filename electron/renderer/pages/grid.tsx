import { EuiText, useEuiTheme } from '@elastic/eui';
import { css } from '@emotion/react';
import { isNil } from 'lodash';
import dynamic from 'next/dynamic';
import { useObservable, useSubscription } from 'observable-hooks';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as rxjs from 'rxjs';
import { Grid } from '../components/grid';
import { useLogger } from '../components/logger';
import { createLogger } from '../lib/logger';

// The grid dynamically modifies the DOM, so we can't use SSR
// because the server and client DOMs will be out of sync.
// https://nextjs.org/docs/messages/react-hydration-error
const GridNoSSR = dynamic(async () => Grid, { ssr: false });

const dougLogger = createLogger('component:doug-cmp');

interface DougCmpProps {
  stream$: rxjs.Observable<{ streamId: string; text: string }>;
}

const DougCmp: React.FC<DougCmpProps> = (props: DougCmpProps): ReactNode => {
  const { stream$ } = props;

  useSubscription(stream$, (stream) => {
    if (stream.text === '__CLEAR_STREAM__') {
      setGameText([]);
    } else if (!isNil(stream.text)) {
      appendGameText(stream.text);
    }
  });

  const { euiTheme } = useEuiTheme();

  const scrollableRef = useRef<HTMLDivElement>(null);
  const scrollBottomRef = useRef<HTMLSpanElement>(null);

  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);

  // TODO make this be dynamically created in `appendGameText`
  //      based on the game event props sent to us
  const textStyles = css({
    fontFamily: euiTheme.font.family,
    fontSize: euiTheme.size.m,
    lineHeight: 'initial',
    paddingLeft: euiTheme.size.s,
    paddingRight: euiTheme.size.s,
  });

  // TODO make array of object with text and style
  const [gameText, setGameText] = useState<Array<string>>([]);

  // TODO make callback take in object with text and style
  const appendGameText = useCallback((newText: string) => {
    const scrollbackBuffer = 500; // max number of most recent lines to keep
    newText = newText.replace(/\n/g, '<br/>');
    setGameText((oldTexts) => {
      return oldTexts.concat(newText).slice(scrollbackBuffer * -1);
    });
  }, []);

  useEffect(() => {
    let scrollableElmt = scrollableRef.current;

    const onScroll = () => {
      scrollableElmt = scrollableRef.current;

      if (!scrollableElmt) {
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = scrollableElmt;
      const difference = scrollHeight - clientHeight - scrollTop;
      const enableAutoScroll = difference <= clientHeight;

      dougLogger.debug('*** onScroll', {
        scrollHeight,
        clientHeight,
        scrollTop,
        difference,
        enableAutoScroll,
      });

      setAutoScrollEnabled(enableAutoScroll);
    };

    scrollableElmt?.addEventListener('scroll', onScroll);

    return () => {
      scrollableElmt?.removeEventListener('scroll', onScroll);
    };
  }, []);

  if (autoScrollEnabled) {
    scrollBottomRef.current?.scrollIntoView({
      behavior: 'instant',
      block: 'end',
      inline: 'nearest',
    });
  }

  return (
    <div
      ref={scrollableRef}
      className={'eui-yScroll'}
      style={{ height: '100%', overflowY: 'scroll' }}
    >
      {gameText.map((text, index) => {
        return (
          <EuiText
            key={index}
            css={textStyles}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        );
      })}
      <span ref={scrollBottomRef} />
    </div>
  );
};

// I started tracking this via `useState` but when calling it's setter
// the value did not update fast enough before a text game event
// was received, resulting in text routing to the wrong stream window.
let gameStreamId = '';

const GridPage: React.FC = (): ReactNode => {
  const { logger } = useLogger('page:grid');

  // Game events by subscribing to the game event IPC channel.
  // Are routed to the correct game stream window via `gameStreamSubject$`.
  const gameEventsSubject$ = useObservable(() => {
    return new rxjs.Subject<{ type: string } & Record<string, any>>();
  });

  // Content destined for a specific game stream window.
  // For example, 'room' or 'combat'.
  const gameStreamSubject$ = useObservable(() => {
    return new rxjs.Subject<{ streamId: string; text: string }>();
  });

  // Track high level game events such as stream ids and formatting.
  // Re-emit text events to the game stream subject to get to grid items.
  useSubscription(gameEventsSubject$, (gameEvent) => {
    switch (gameEvent.type) {
      case 'CLEAR_STREAM':
        gameStreamSubject$.next({
          streamId: gameEvent.streamId,
          text: '__CLEAR_STREAM__',
        });
        break;
      case 'PUSH_STREAM':
        gameStreamId = gameEvent.streamId;
        break;
      case 'POP_STREAM':
        gameStreamId = '';
        break;
      case 'TEXT_OUTPUT_CLASS':
        // TODO
        break;
      case 'TEXT_STYLE_PRESET':
        // TODO
        break;
      case 'TEXT':
        gameStreamSubject$.next({
          streamId: gameStreamId,
          text: gameEvent.text,
        });
        break;
      case 'EXPERIENCE':
        gameStreamSubject$.next({
          streamId: 'experience',
          text: gameEvent.text,
        });
        break;
      case 'ROOM':
        // TODO
        break;
      case 'COMPASS':
        // TODO
        break;
      case 'VITALS':
        // TODO
        break;
      case 'INDICATOR':
        // TODO
        break;
      case 'SPELL':
        // TODO
        break;
      case 'LEFT_HAND':
        // TODO
        break;
      case 'RIGHT_HAND':
        // TODO
        break;
      case 'SERVER_TIME':
        // TODO
        break;
      case 'ROUND_TIME':
        // TODO
        break;
    }
  });

  useEffect(() => {
    window.api.onMessage(
      'game:connect',
      (_event, { accountName, characterName, gameCode }) => {
        logger.info('game:connect', { accountName, characterName, gameCode });
      }
    );

    return () => {
      window.api.removeAllListeners('game:connect');
    };
  }, [logger]);

  useEffect(() => {
    window.api.onMessage(
      'game:disconnect',
      (_event, { accountName, characterName, gameCode }) => {
        logger.info('game:disconnect', {
          accountName,
          characterName,
          gameCode,
        });
      }
    );

    return () => {
      window.api.removeAllListeners('game:disconnect');
    };
  }, [logger]);

  useEffect(() => {
    window.api.onMessage('game:error', (_event, error: Error) => {
      logger.error('game:error', { error });
    });

    return () => {
      window.api.removeAllListeners('game:error');
    };
  }, [logger]);

  useEffect(() => {
    window.api.onMessage('game:event', (_event, gameEvent) => {
      logger.debug('game:event', { gameEvent });
      gameEventsSubject$.next(gameEvent);
    });

    return () => {
      window.api.removeAllListeners('game:event');
    };
  }, [logger, gameEventsSubject$]);

  // TODO the list of items we inject should come from user preferences
  //      if none then provide our own default list
  // TODO users should be able to add/remove items from the grid
  //      we already support closing grid items, but not synced to prefs yet

  // TODO subscribe to game events and route them to the correct grid item

  return (
    <GridNoSSR
      items={[
        {
          itemId: 'room',
          title: 'Room',
          content: (
            <DougCmp
              stream$={gameStreamSubject$.pipe(
                rxjs.filter((m) => m.streamId === 'room')
              )}
            />
          ),
        },
        {
          itemId: 'experience',
          title: 'Experience',
          content: (
            <DougCmp
              stream$={gameStreamSubject$.pipe(
                rxjs.filter((m) => m.streamId === 'experience')
              )}
            />
          ),
        },
        {
          itemId: 'percWindow',
          title: 'Spells',
          content: (
            <DougCmp
              stream$={gameStreamSubject$.pipe(
                rxjs.filter((m) => m.streamId === 'percWindow')
              )}
            />
          ),
        },
        {
          itemId: 'inv',
          title: 'Inventory',
          content: (
            <DougCmp
              stream$={gameStreamSubject$.pipe(
                rxjs.filter((m) => m.streamId === 'inv')
              )}
            />
          ),
        },
        {
          itemId: 'familiar',
          title: 'Familiar',
          content: (
            <DougCmp
              stream$={gameStreamSubject$.pipe(
                rxjs.filter((m) => m.streamId === 'familiar')
              )}
            />
          ),
        },
        {
          itemId: 'thoughts',
          title: 'Thoughts',
          content: (
            <DougCmp
              stream$={gameStreamSubject$.pipe(
                rxjs.filter((m) => m.streamId === 'thoughts')
              )}
            />
          ),
        },
        {
          itemId: 'combat',
          title: 'Combat',
          content: (
            <DougCmp
              stream$={gameStreamSubject$.pipe(
                rxjs.filter((m) => m.streamId === 'combat')
              )}
            />
          ),
        },
        {
          itemId: 'main',
          title: 'Main',
          content: (
            <DougCmp
              stream$={gameStreamSubject$.pipe(
                rxjs.filter((m) => m.streamId === '')
              )}
            />
          ),
        },
      ]}
    />
  );
};

export default GridPage;
