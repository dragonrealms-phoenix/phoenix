import { EuiPanel, EuiSpacer } from '@elastic/eui';
import { useObservable, useSubscription } from 'observable-hooks';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type * as rxjs from 'rxjs';
import type { GameLogLine } from '../../types/game.types.jsx';
import { GameStreamText } from './game-stream-text.jsx';
import {
  excludeDuplicateEmptyLines,
  filterLinesForGameStreams,
} from './game.utils.js';

export interface GameStreamProps {
  /**
   * The stream of game text to display.
   * The stream is additive, so each new line will be appended to the end.
   * The special log line text '__CLEAR_STREAM__' will clear all prior lines.
   */
  stream$: rxjs.Observable<GameLogLine>;
  /**
   * The list of game stream ids that this component should display.
   * Most components will only display a single stream id.
   */
  gameStreamIds: Array<string>;
  /**
   * The maximum number of lines to keep in the game log.
   * The oldest lines will be dropped to stay within this limit.
   * Default is 500.
   */
  maxLines?: number;
}

export const GameStream: React.FC<GameStreamProps> = (
  props: GameStreamProps
): ReactNode => {
  const { stream$, gameStreamIds, maxLines = 500 } = props;

  const filteredStream$ = useObservable(() => {
    return stream$.pipe(
      filterLinesForGameStreams({ gameStreamIds }),
      excludeDuplicateEmptyLines
    );
  });

  const [gameLogLines, setGameLogLines] = useState<Array<GameLogLine>>([]);
  const clearStreamTimeoutRef = useRef<NodeJS.Timeout>();

  const appendGameLogLines = useCallback(
    (newLogLines: Array<GameLogLine>) => {
      setGameLogLines((oldLogLines: Array<GameLogLine>): Array<GameLogLine> => {
      // Append new log line to the list.
      newLogLines = oldLogLines.concat(newLogLines);
      // Trim the back of the list to keep it within the scrollback buffer.
        newLogLines = newLogLines.slice(maxLines * -1);
      return newLogLines;
    });
    },
    [maxLines]
  );

  // Ensure all timeouts are cleared when the component is unmounted.
  useEffect(() => {
    return () => {
      clearTimeout(clearStreamTimeoutRef.current);
    };
  }, []);

  useSubscription(filteredStream$, (logLine: GameLogLine) => {
    // Decouple state updates from the stream subscription to mitigate
    // "Cannot update a component while rendering a different component".
    // This gives some control of the event loop back to react
    // to smartly (re)render all components and state changes.
    // We use `setTimeout` because browser doesn't have `setImmediate`.
    setTimeout(() => {
      if (logLine.text === '__CLEAR_STREAM__') {
        // Clear the stream after a short delay to prevent flickering
        // caused by a flash of empty content then the new content.
        clearStreamTimeoutRef.current = setTimeout(() => {
          setGameLogLines([]);
        }, 1000);
      } else {
        // If we receieved a new log line, cancel any pending clear stream.
        // Set the game log lines to the new log line to prevent flickering.
        if (clearStreamTimeoutRef.current) {
          clearTimeout(clearStreamTimeoutRef.current);
          clearStreamTimeoutRef.current = undefined;
          setGameLogLines([logLine]);
        } else {
          appendGameLogLines([logLine]);
        }
      }
    });
  });

  // Scroll to the bottom of the scrollable element when new content is added.
  // https://css-tricks.com/books/greatest-css-tricks/pin-scrolling-to-bottom/
  const scrollableRef = useRef<HTMLDivElement>(null);
  const scrollTargetRef = useRef<HTMLDivElement>(null);
  const didInitialScrollRef = useRef<boolean>(false);

  // The scroll behavior of `overflowAnchor: auto` doesn't take effect
  // to pin the content to the bottom until after an initial scroll event.
  // Therefore, on each render we check if sufficient content has been
  // added to the scrollable element to warrant an initial scroll.
  // After that, the browser handles it automatically.
  useEffect(() => {
    if (
      // We haven't done an initial scroll yet.
      !didInitialScrollRef.current &&
      // There's something to scroll to.
      scrollTargetRef.current &&
      scrollableRef.current &&
      // The scrollable element is scrollable.
      scrollableRef.current.scrollHeight > scrollableRef.current.clientHeight
    ) {
      didInitialScrollRef.current = true;
      scrollTargetRef.current.scrollIntoView({
        behavior: 'instant',
        block: 'end',
        inline: 'nearest',
      });
    }
  });

  return (
    <EuiPanel
      panelRef={scrollableRef}
      // For the 'scroll' event to fire on the element, the overflow
      // property must be set. We rely on this to know if the user has
      // scrolled to the bottom and we should engage in auto-scrolling,
      // or if they have scrolled away and we should not auto-scroll.
      css={{
        overflowY: 'scroll',
        height: '100%',
      }}
      className="eui-scrollBar"
      paddingSize="none"
      hasBorder={false}
      hasShadow={false}
    >
      {/*
        Disable scroll anchor so that when the user scrolls up in the stream
        then as new content arrives it doesn't force the scroll position back.
        Only when the user is scrolled to the bottom will the scroll position
        be pinned to the bottom because that's the element with an anchor.
       */}
      <div css={{ overflowAnchor: 'none' }}>
        {gameLogLines.map((logLine) => {
          return <GameStreamText key={logLine.eventId} logLine={logLine} />;
        })}
      </div>
      <EuiSpacer size="s" />
      <div ref={scrollTargetRef} css={{ overflowAnchor: 'auto' }} />
    </EuiPanel>
  );
};

GameStream.displayName = 'GameStream';
