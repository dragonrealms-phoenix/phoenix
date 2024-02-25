import { css } from '@emotion/react';
import * as rxjs from 'rxjs';
import type { GameLogLine } from '../../types/game.types';

/**
 * To help filter out duplicate empty log lines.
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
 * After an empty log line is emitted, it will discard any subsequent
 * empty log lines until a non-empty log line is emitted.
 *
 * This tidies up the game stream we show the user because the game may
 * send us multiple empty server prompts, such as when updating us
 * of the game server time or other behind-the-scenes things.
 *
 * Before:
 * ```
 *  >
 *  Katoak arrives.
 *  >
 *  >
 *  >
 *  Katoak leaves west.
 * ```
 *
 * After:
 * ```
 *  >
 *  Katoak arrives.
 *  >
 *  Katoak leaves west.
 * ```
 */
export const excludeDuplicateEmptyLines: rxjs.MonoTypeOperatorFunction<
  GameLogLine
> = (observable: rxjs.Observable<GameLogLine>) => {
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

/**
 * Discard any log lines that are not for the given game streams.
 */
export const filterLinesForGameStreams = (options: {
  gameStreamIds: Array<string>;
}): rxjs.MonoTypeOperatorFunction<GameLogLine> => {
  const { gameStreamIds } = options;

  return (observable: rxjs.Observable<GameLogLine>) => {
    return observable.pipe(
      rxjs.filter((logLine) => {
        return gameStreamIds.includes(logLine.streamId);
      })
    );
  };
};
