import * as rxjs from 'rxjs';
import type { GameLogLine } from '../../types/game.types.jsx';

/**
 * Matches a log line that is either a newline or a prompt.
 * Effectively, an "empty" log line to the player.
 * https://regex101.com/r/TbkDIb/1
 */
const emptyLogLineRegex = /^(>?)(\n+)$/;

const isEmptyLogLine = (logLine: GameLogLine): boolean => {
  return emptyLogLineRegex.test(logLine.text);
};

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
    // Compare the current and next log lines to decide whether to emit or not.
    // https://www.learnrxjs.io/learn-rxjs/operators/transformation/buffercount
    rxjs.bufferCount(2, 1),
    // Inspect buffer to identify if there are duplicate empty lines.
    // If yes, emit only one and standardize on the prompt format.
    rxjs.map(([curr, next]) => {
      if (isEmptyLogLine(curr) && isEmptyLogLine(next)) {
        return { ...curr, text: '>\n' };
      }
      return curr;
    }),
    // Emit only unique log lines.
    rxjs.distinctUntilChanged((prev, curr) => {
      return isEmptyLogLine(prev) && isEmptyLogLine(curr);
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
