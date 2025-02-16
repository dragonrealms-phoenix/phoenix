import { EuiPanel, EuiSpacer } from '@elastic/eui';
import { useObservable, useSubscription } from 'observable-hooks';
import type { ReactNode } from 'react';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import type * as rxjs from 'rxjs';
import { GameContext } from '../../context/game.jsx';
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
   * The special log line text `'__CLEAR_STREAM__'` will clear all prior lines.
   */
  stream$: rxjs.Observable<GameLogLine>;
  /**
   * The primary stream id that this component should display.
   * If other streams are redirected to this stream, only the "clear stream"
   * events for the primary stream will be honored, otherwise the stream
   * may be cleared too often.
   */
  primaryStreamId: string;
  /**
   * The list of game stream ids that this component should display.
   * Most components will only display their primary stream id,
   * but players may redirect streams to another to reduce the number
   * of stream windows they need open. For example, to redirect the
   * 'assess' and 'combat' streams to the 'main' primary stream.
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
  const { stream$, primaryStreamId, gameStreamIds, maxLines = 500 } = props;

  const { isConnected } = useContext(GameContext);
  const [gameLogLines, setGameLogLines] = useState<Array<GameLogLine>>([]);
  const clearStreamTimeoutRef = useRef<NodeJS.Timeout>();

  // Clear streams when reconnect to game.
  useEffect(() => {
    if (isConnected) {
      setGameLogLines([]);
    }
  }, [isConnected]);

  // Ensure all timeouts are cleared when the component is unmounted.
  useEffect(() => {
    return () => {
      clearTimeout(clearStreamTimeoutRef.current);
    };
  }, []);

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

  const filteredStream$ = useObservable(() => {
    return stream$.pipe(
      filterLinesForGameStreams({ gameStreamIds }),
      excludeDuplicateEmptyLines
    );
  });

  useSubscription(filteredStream$, (logLine: GameLogLine) => {
    // Decouple state updates from the stream subscription to mitigate
    // "Cannot update a component while rendering a different component".
    // This gives some control of the event loop back to react
    // to smartly (re)render all components and state changes.
    // We use `setTimeout` because browser doesn't have `setImmediate`.
    setTimeout(() => {
      if (logLine.text === '__CLEAR_STREAM__') {
        if (logLine.streamId === primaryStreamId) {
          // Clear the stream after a short delay to prevent flickering
          // caused by a flash of empty content then the new content.
          clearStreamTimeoutRef.current = setTimeout(() => {
            setGameLogLines([]);
          }, 1000);
        }
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
  const observedTargetCountRef = useRef<number>(0);

  // The scroll behavior of `overflowAnchor: auto` doesn't take effect
  // to pin the content to the bottom until after an initial scroll event.
  // Therefore, we observe the target to know if sufficient content has been
  // added to the scrollable element to warrant an initial scroll.
  // After that, the browser handles it automatically.
  useEffect(() => {
    // Reset counter when we reconnect to the game.
    // For example, when changing characters.
    // Otherwise, the new stream of text won't scroll
    // the window to the bottom as the user would expect.
    observedTargetCountRef.current = 0;

    const callback: IntersectionObserverCallback = (
      entries: Array<IntersectionObserverEntry>
    ) => {
      // The callback receives an entry for each observed target.
      // In practice, we are only observing one target so we loop once.
      entries.forEach((entry) => {
        // When the component is first rendering, there is a period where
        // there is no content and the scroll target is not visible.
        // The observer invokes the callback that initial time, but we
        // don't actually want to scroll to the bottom then, it's too soon.
        // So we ignore the first invocation and only scroll on the second.
        observedTargetCountRef.current += 1;
        if (observedTargetCountRef.current <= 1) {
          return;
        }
        // If the scroll target is visible, nothing to do yet.
        if (entry.isIntersecting) {
          return;
        }
        // The scroll target is now not visible, meaning that there's
        // enough content on screen to cause the window to scroll.
        // Perform our initial scroll to bottom and disconnect the observer.
        // From now on, if the user scrolls away that's fine, we won't keep
        // it pinned to bottom until they scroll back to bottom.
        observer.disconnect();
        scrollTargetRef.current?.scrollIntoView({
          behavior: 'instant',
          block: 'end',
          inline: 'nearest',
        });
      });
    };

    const observer = new IntersectionObserver(callback, {
      threshold: 1.0,
    });

    if (scrollTargetRef.current) {
      observer.observe(scrollTargetRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [isConnected]);

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
