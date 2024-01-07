import { EuiText } from '@elastic/eui';
import { useObservable, useSubscription } from 'observable-hooks';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as rxjs from 'rxjs';
import type { GameLogLine } from './game.types';

export interface GameContentProps {
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
   * Enable to automatically scroll to the bottom of the game stream window
   * as new log lines are added. This effect only occurs if the user
   * is already scrolled to the bottom to ensure they see latest content.
   */
  enableScrollToNewLogLines: boolean;
}

export const GameContent: React.FC<GameContentProps> = (
  props: GameContentProps
): ReactNode => {
  const { stream$, gameStreamIds, enableScrollToNewLogLines } = props;

  const filteredStream$ = useObservable(() => {
    return stream$.pipe(rxjs.filter((m) => gameStreamIds.includes(m.streamId)));
  });

  useSubscription(filteredStream$, (logLine) => {
    if (logLine.text === '__CLEAR_STREAM__') {
      setGameLogLines([]);
    } else {
      appendGameLogLine(logLine);
    }
  });

  const scrollableRef = useRef<HTMLDivElement>(null);
  const scrollBottomRef = useRef<HTMLSpanElement>(null);

  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(
    enableScrollToNewLogLines
  );

  const [gameLogLines, setGameLogLines] = useState<Array<GameLogLine>>([]);

  const appendGameLogLine = useCallback((newLogLine: GameLogLine) => {
    // Max number of most recent lines to keep.
    const scrollbackBuffer = 500;
    setGameLogLines((oldLogLines) => {
      // Append new log line to the list.
      let newLogLines = oldLogLines.concat(newLogLine);
      // Trim the back of the list to keep it within the scrollback buffer.
      newLogLines = newLogLines.slice(scrollbackBuffer * -1);
      return newLogLines;
    });
  }, []);

  useEffect(() => {
    if (!enableScrollToNewLogLines) {
      return;
    }

    let scrollableElmt = scrollableRef.current;

    const onScroll = () => {
      scrollableElmt = scrollableRef.current;

      if (!scrollableElmt) {
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = scrollableElmt;
      const difference = scrollHeight - clientHeight - scrollTop;
      const enableAutoScroll = difference <= clientHeight;

      setAutoScrollEnabled(enableAutoScroll);
    };

    scrollableElmt?.addEventListener('scroll', onScroll);

    return () => {
      scrollableElmt?.removeEventListener('scroll', onScroll);
    };
  }, [enableScrollToNewLogLines]);

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
      {gameLogLines.map((logLine) => {
        return (
          <EuiText key={logLine.eventId} css={logLine.styles}>
            {logLine.text}
          </EuiText>
        );
      })}
      <span ref={scrollBottomRef} />
    </div>
  );
};

GameContent.displayName = 'GameContent';
