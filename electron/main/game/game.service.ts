import { app } from 'electron';
import path from 'node:path';
import fs from 'fs-extra';
import * as rxjs from 'rxjs';
import { waitUntil } from '../../common/async/async.utils.js';
import type {
  GameEvent,
  StyledTextGameEvent,
  StyledTextSegment,
} from '../../common/game/types.js';
import { GameEventType } from '../../common/game/types.js';
import { LogLevel } from '../../common/logger/types.js';
import { isLogLevelEnabled } from '../logger/logger.utils.js';
import { HighlightSettingServiceImpl } from '../setting/highlight/highlight.service.js';
import {
  HighlightMatchType,
  type HighlightSetting,
} from '../setting/highlight/types.js';
import type { SGEGameCredentials } from '../sge/types.js';
import { GameParserImpl } from './game.parser.js';
import { GameSocketImpl } from './game.socket.js';
import { gameServiceLogger as logger } from './logger.js';
import type { GameParser, GameService, GameSocket } from './types.js';

/**
 * This class isn't exported. To ensure a single instance exists then
 * it's exposed through the exported `Game` object at bottom of this file.
 */
export class GameServiceImpl implements GameService {
  /**
   * Indicates if the protocol to authenticate to the game server has completed.
   * There is a brief delay after sending credentials before the game server
   * is ready to receive commands. Sending commands too early will fail.
   */
  private _isConnected = false;
  private _isDestroyed = false;

  /**
   * Socket to communicate with the game server.
   */
  private socket: GameSocket;

  /**
   * Parses game socket output into game events.
   */
  private parser: GameParser;

  constructor(options: { credentials: SGEGameCredentials }) {
    const { credentials } = options;
    this.parser = new GameParserImpl();
    this.socket = new GameSocketImpl({
      credentials,
      onConnect: () => {
        this._isConnected = true;
        this._isDestroyed = false;
      },
      onDisconnect: () => {
        this._isConnected = false;
        this._isDestroyed = true;
      },
    });
  }

  public isConnected(): boolean {
    return this._isConnected;
  }

  public async connect(): Promise<rxjs.Observable<GameEvent>> {
    if (this._isConnected) {
      await this.disconnect();
    }

    logger.info('connecting');

    const socketData$ = await this.socket.connect();

    const highlightService = new HighlightSettingServiceImpl({
      filePath: path.join(
        process.cwd(),
        'electron',
        'main',
        'setting',
        'highlight',
        '__tests__',
        'file.cfg'
      ),
    });
    const highlights = await highlightService.load();

    const gameEvents$ = this.parser.parse(socketData$).pipe(
      rxjs.concatMap(async (gameEvent): Promise<GameEvent> => {
        if (gameEvent.type !== GameEventType.TEXT) {
          return gameEvent;
        }
        // TODO substitutions
        // TODO ignores
        // TODO triggers
        // TODO highlights
        // TODO emit as StyledTextGameEvent
        const styledTextEvent: StyledTextGameEvent = {
          eventId: gameEvent.eventId,
          type: GameEventType.STYLED_TEXT,
          text: gameEvent.text,
          segments: applyHighlights(gameEvent.text, highlights),
        };
        logger.info('***', { styledTextEvent });
        // return styledTextEvent;
        return gameEvent;
      })
    );

    if (isLogLevelEnabled(LogLevel.TRACE)) {
      this.logGameStreams({
        socketData$,
        gameEvents$,
      });
    }

    return gameEvents$;
  }

  public async disconnect(): Promise<void> {
    if (!this._isDestroyed) {
      logger.info('disconnecting');
      await this.socket.disconnect();
      await this.waitUntilDestroyed();
    }
  }

  public send(command: string): void {
    if (this._isConnected) {
      logger.debug('sending command', { command });
      this.socket.send(command);
    }
  }

  protected async waitUntilDestroyed(): Promise<void> {
    const interval = 200;
    const timeout = 5000;

    const result = await waitUntil({
      condition: () => this._isDestroyed,
      interval,
      timeout,
    });

    if (!result) {
      throw new Error(`[GAME:SERVICE:DISCONNECT:TIMEOUT] ${timeout}`);
    }
  }

  protected logGameStreams(options: {
    socketData$: rxjs.Observable<string>;
    gameEvents$: rxjs.Observable<GameEvent>;
  }): void {
    const { socketData$, gameEvents$ } = options;

    const writeStreamToFile = <T>(options: {
      stream$: rxjs.Observable<T>;
      filePath: string;
    }): void => {
      const { stream$, filePath } = options;

      const fileWriteStream = fs.createWriteStream(filePath);

      stream$.subscribe({
        next: (data: T) => {
          if (typeof data === 'object') {
            fileWriteStream.write(`---\n${JSON.stringify(data, null, 2)}`);
          } else {
            fileWriteStream.write(`---\n${data}`);
          }
        },
        error: () => {
          fileWriteStream.end();
        },
        complete: () => {
          fileWriteStream.end();
        },
      });
    };

    const logPath = app.getPath('logs');
    const socketLogPath = path.join(logPath, 'game-socket.log');
    const eventLogPath = path.join(logPath, 'game-event.log');

    writeStreamToFile({ stream$: socketData$, filePath: socketLogPath });
    writeStreamToFile({ stream$: gameEvents$, filePath: eventLogPath });
  }
}

/**
 * Apply multiple regex patterns to highlight a line of text.
 */
export const applyHighlights = (
  text: string,
  settings: Array<HighlightSetting>
): Array<StyledTextSegment> => {
  const matches: Array<StyledTextSegment> = [];

  for (const setting of settings) {
    console.log('setting', setting);

    const { matchType, pattern } = setting;

    if (matchType !== HighlightMatchType.REGEX) {
      // TODO implement other match types
      continue;
    }

    const settingMatches = getAllMatches({ text, pattern });
    console.log('settingMatches', settingMatches);
    matches.push(...settingMatches);
  }

  const sortedMatches = matches.sort((a, b) => a.start - b.start);

  // Iterate the sorted matches, checking if the current entry starts within
  // the previous entry. If yes, then split the previous entry into two such
  // that the first part of the previous entry ends at the start of the current entry,
  // and the second part of the previous entry starts at the end of the current entry.
  // In this way, ensure that all entries never overlap.
  //
  // Example Input:
  /*
   *   [
   *     { text: 'quick brown fox', start:  4, end:  19 },
   *     { text: 'brown', start:  10, end:  15 },
   *     { text: 'fox jumped', start: 16, 26 }
   *   ]
   */
  // Example Output after Pass 1 because 'brown' starts within 'quick brown fox':
  /*
   *  [
   *    { text: 'quick ', start: 4, end: 10 },
   *    { text: 'brown', start: 10, end: 15 },
   *    { text: ' fox', start: 15, end: 19 },
   *    { text: 'fox jumped', start: 16, 26 }
   *  ]
   */
  // Example Output after Pass 2 because 'fox jumped' overlaps with ' fox':
  /*
   *  [
   *    { text: 'quick ', start: 4, end: 10 },
   *    { text: 'brown', start: 10, end: 15 },
   *    { text: ' ', start: 15, end: 16 },
   *    { text: 'fox jumped', start: 16, 26 }
   *  ]
   */
  for (let i = 1; i < sortedMatches.length; i += 1) {
    const current = sortedMatches[i];
    const previous = sortedMatches[i - 1];

    if (current.start < previous.end) {
      const firstPart: StyledTextSegment = {
        text: previous.text.substring(0, current.start - previous.start),
        start: previous.start,
        end: current.start,
      };
      const secondPart: StyledTextSegment = {
        text: previous.text.substring(current.start - previous.start),
        start: current.start,
        end: previous.end,
      };
      matches.splice(i - 1, 1, firstPart, secondPart);
    }
  }

  // Process text into non-overlapping highlighted segments
  const result: Array<StyledTextSegment> = [];

  let index = 0;
  for (const match of matches) {
    if (index < match.start) {
      result.push({
        text: text.slice(index, match.start),
        start: index,
        end: match.start,
      });
    }
    result.push(match);
    index = match.end;
  }

  return result;
};

interface RegExpMatchResult {
  /**
   * The matched text.
   */
  text: string;
  /**
   * The start index of the match in the original text.
   */
  start: number;
  /**
   * The end index of the match in the original text.
   */
  end: number;
}

/**
 * Executes a regex pattern against text then returns all the captured groups.
 * Uses the 'd' and 'g' flags to include the `indices` property in the match.
 *
 * Example:
 * ```
 *   text: 'The quick brown fox'
 *   pattern: 'The (quick) brown (fox)'
 *   returns: [
 *     { text: 'quick', start:  4, end:  9 },
 *     { text: 'fox',   start: 16, end: 19 },
 *   ]
 * ```
 */
const getAllMatches = (options: {
  /**
   * The text to search for matches.
   *
   * Example: 'The quick brown fox'.
   */
  text: string;
  /**
   * A regular expression to match against the text.
   * The flags `d` and `g` will be used.
   *
   * Example: 'The (quick) brown (fox)'.
   */
  pattern: string;
}): Array<RegExpMatchResult> => {
  const { text, pattern } = options;

  console.log('get all matches', { text, pattern });

  const results = new Array<RegExpMatchResult>();

  // Since regexp objects maintain state, we don't accept them
  // as an argument but rather instantiate a new one each time.
  const regex = getCachedRegExp(pattern, 'dg');
  regex.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    // The indices property will be defined because we used the 'd' flag.
    // But typescript doesn't know that.
    if (!match.indices) {
      console.log('no indices', match);
      continue;
    }
    for (let i = 1; i < match.indices.length; i += 1) {
      const [start, end] = match.indices[i];
      results.push({ text: match[i], start, end });
    }
  }

  console.log('results', results);
  return results;
};

const regexCache: { [key: string]: RegExp } = {};

const getCachedRegExp = (pattern: string, flags: string): RegExp => {
  const cacheKey = `${pattern}_${flags}`;
  regexCache[cacheKey] ||= new RegExp(pattern, flags);
  return regexCache[cacheKey];
};
