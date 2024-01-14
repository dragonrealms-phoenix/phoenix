import { EuiPanel, EuiSpacer, EuiText } from '@elastic/eui';
import { css } from '@emotion/react';
import { useObservable, useSubscription } from 'observable-hooks';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as rxjs from 'rxjs';
import type { GameLogLine } from '../../types/game.types';

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

/**
 * To help filter out duplicate empty log lines.
 * See the rxjs filter logic in the GameContent component's stream.
 */
const emptyLogLine: GameLogLine = {
  eventId: '',
  streamId: '',
  text: '',
  styles: css(),
};

/**
 * Matches a log line that is either a newline or a prompt.
 * Effectively, an "empty" log line to the player.
 * https://regex101.com/r/TbkDIb/1
 */
const emptyLogLineRegex = /^(>?)(\n+)$/;

/**
 * For the 'scroll' event to fire on the element, the overflow
 * property must be set. We rely on this to know if the user has
 * scrolled to the bottom (and we should engage in auto-scrolling)
 * or if they have scrolled away from the bottom (and we should
 * not auto-scroll).
 */
const scrollablePanelStyles = css({
  overflowY: 'scroll',
  height: '100%',
});

const filterDuplicateEmptyLines: rxjs.MonoTypeOperatorFunction<GameLogLine> = (
  observable: rxjs.Observable<GameLogLine>
) => {
  return observable.pipe(
    // To do this, we need to compare the previous and current log lines.
    // We start with a blank log line so that the first real one is emitted.
    rxjs.startWith(emptyLogLine),
    rxjs.pairwise(),
    rxjs.filter(([prev, curr]) => {
      const previousText = prev.text;
      const currentText = curr.text;

      const previousWasNewline = emptyLogLineRegex.test(previousText);
      const currentIsNewline = emptyLogLineRegex.test(currentText);

      if (!currentIsNewline || (currentIsNewline && !previousWasNewline)) {
        return true;
      }
      return false;
    }),
    // Unwind the pairwise to emit the current log line.
    rxjs.map(([_prev, curr]) => {
      return curr;
    })
  );
};

export const GameContent: React.FC<GameContentProps> = (
  props: GameContentProps
): ReactNode => {
  const { stream$, gameStreamIds, enableScrollToNewLogLines } = props;

  const filteredStream$ = useObservable(() => {
    return stream$.pipe(
      // Filter to only the game stream ids we care about.
      rxjs.filter((logLine) => {
        return gameStreamIds.includes(logLine.streamId);
      }),
      // Avoid sending multiple blank newlines or prompts.
      filterDuplicateEmptyLines
    );
  });

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

  const clearStreamTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Ensure all timeouts are cleared when the component is unmounted.
  useEffect(() => {
    return () => {
      clearTimeout(clearStreamTimeoutRef.current);
    };
  }, []);

  useSubscription(filteredStream$, (logLine) => {
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
        appendGameLogLine(logLine);
      }
    }
  });

  const scrollableRef = useRef<HTMLDivElement>(null);
  const scrollBottomRef = useRef<HTMLDivElement>(null);

  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(
    enableScrollToNewLogLines
  );

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

  useEffect(() => {
    if (autoScrollEnabled) {
      scrollBottomRef.current?.scrollIntoView({
        behavior: 'instant',
        block: 'end',
        inline: 'nearest',
      });
    }
  });

  return (
    <EuiPanel
      panelRef={scrollableRef}
      css={scrollablePanelStyles}
      paddingSize="none"
      hasBorder={false}
      hasShadow={false}
    >
      {gameLogLines.map((logLine) => {
        return (
          <EuiText key={logLine.eventId} css={logLine.styles}>
            <span dangerouslySetInnerHTML={{ __html: logLine.text }} />
          </EuiText>
        );
      })}
      <EuiSpacer size="s" />
      <div ref={scrollBottomRef} />
    </EuiPanel>
  );
};

GameContent.displayName = 'GameContent';
