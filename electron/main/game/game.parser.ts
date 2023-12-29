import * as rxjs from 'rxjs';
import { sliceStart } from '../../common/string';
import { createLogger } from '../logger';
import { GameEventType } from './game.types';
import type {
  GameEvent,
  GameParser,
  IndicatorType,
  RoomGameEvent,
} from './game.types';

/**
 * Match all text up to the next tag.
 * https://regex101.com/r/6IOPFH/1
 */
const TEXT_REGEX = /^([^<]+)/;

/**
 * Match the entirety of a start tag.
 * https://regex101.com/r/wTqhlO/1
 */
const START_TAG_REGEX = /^(<[^<]+>)/;

/**
 * Match the name of the start tag.
 * The first captured group is the tag name.
 * https://regex101.com/r/nN4MLq/1
 */
const START_TAG_NAME_REGEX = /^<([^\s>/]+)/;

/**
 * Matches all the key="value" pairs in a start tag.
 * For each match, the first captured group is the attribute name
 * and the third captured group is the attribute value.
 * https://regex101.com/r/d76B05/1
 */
const START_TAG_ATTRIBUTES_REGEX = /([a-zA-Z][\w-]*)=(["'])(.*?)\2/g;

/**
 * Match the entirety of an end tag.
 * https://regex101.com/r/TwwYPJ/1
 */
const END_TAG_REGEX = /^(<\/[^<]+>)/;

/**
 * Match the name of the end tag.
 * The first captured group is the tag name.
 * https://regex101.com/r/HX1Evy/1
 */
const END_TAG_NAME_REGEX = /^<\/([^\s>/]+)/;

/**
 * Map of the component ids that describe a part of the current room
 * to their room game event property name.
 */
const ROOM_ID_TO_EVENT_PROPERTY_MAP: Record<string, keyof RoomGameEvent> = {
  'room name': 'roomName',
  'room desc': 'roomDescription',
  'room creatures': 'roomCreatures',
  'room objects': 'roomObjects',
  'room players': 'roomPlayers',
  'room exits': 'roomExits',
};

/**
 * Represents basic tag information parsed from the game socket data.
 */
interface Tag {
  /**
   * ID attribute of the tag.
   * Not all tags have an ID, but it's common enough
   * that I wanted it to be easy to reference.
   */
  id?: string;

  /**
   * Name of the tag.
   */
  name: string;

  /**
   * Attributes of the tag.
   */
  attributes: Record<string, string>;
}

const logger = createLogger('game:parser');

/**
 * Inspired by Lich's XMLParser.
 * https://github.dev/elanthia-online/lich-5/blob/master/lib/xmlparser.rb
 */
export class GameParserImpl implements GameParser {
  /**
   * For emitting game events as we parse them from the game socket data.
   */
  private gameEventsSubject$: rxjs.Subject<GameEvent>;

  /**
   * As we encounter XML tags and nested tags,
   * we push their data onto this stack to track them.
   */
  private activeTags: Array<Tag>;

  /**
   * Any text that should be emitted as a game event.
   * This might be a room description, inventory, whispers, etc.
   * Is set, updated, cleared, and emitted based on the game events.
   */
  private gameText: string;

  constructor() {
    this.gameEventsSubject$ = new rxjs.Subject<GameEvent>();
    this.activeTags = [];
    this.gameText = '';
  }

  /**
   * As the game socket data is parsed into game events,
   * those game events are emitted as quickly as possible.
   * Socket data may represent zero, one, or multiple game events.
   * Socket data may include multiple lines of data to parse.
   */
  public parse(
    gameSocketStream: rxjs.Observable<string>
  ): rxjs.Observable<GameEvent> {
    logger.info('subscribing to game socket stream');
    gameSocketStream.subscribe({
      next: (socketData: string) => {
        logger.debug('parsing game socket data', { socketData });
        const lines = this.convertSocketDataToLines(socketData);
        this.parseLines(lines);
      },
      error: (error: Error) => {
        logger.error('game socket stream error', { error });
        this.gameEventsSubject$.error(error);
      },
      complete: () => {
        logger.info('game socket stream completed');
        this.gameEventsSubject$.complete();
      },
    });
    return this.gameEventsSubject$.asObservable();
  }

  protected convertSocketDataToLines(socketData: string): Array<string> {
    // Standardize on one way of representing newlines.
    socketData = socketData.replace(/\r\n/g, '\n');

    // Before we split the data into lines, remove the trailing newline
    // otherwise we'll end up with an extra empty line at the end of the array,
    // which is ambiguous of actual empty lines in the data we need to preserve.
    if (socketData.endsWith('\n')) {
      socketData = socketData.slice(0, -1);
    }

    // To preserve whitespace, add the newline back that we split off.
    const lines = socketData.split('\n').map((line) => `${line}\n`);

    return lines;
  }

  protected parseLines(lines: Array<string>): void {
    lines.forEach((line: string) => {
      this.parseLine(line);
    });
  }

  protected parseLine(line: string): void {
    this.gameText = '';

    logger.debug('parsing line', { line });

    while (line.length > 0) {
      /*
       * TEXT
       */

      const textSliceResult = sliceStart({
        text: line,
        regex: TEXT_REGEX,
      });

      if (textSliceResult.match) {
        logger.debug('parsed text', { text: textSliceResult.match });
        this.processText(textSliceResult.match);
        line = textSliceResult.remaining;
        continue;
      }

      /*
       * END TAG
       */

      const endTagSliceResult = sliceStart({
        text: line,
        regex: END_TAG_REGEX,
      });

      if (endTagSliceResult.match) {
        const endTagNameSliceResult = sliceStart({
          text: endTagSliceResult.match,
          regex: END_TAG_NAME_REGEX,
        });

        if (endTagNameSliceResult.match) {
          const tagName = endTagNameSliceResult.match;
          logger.debug('parsed end tag', { tagName });
          this.processTagEnd();
        }

        line = endTagSliceResult.remaining;
        continue;
      }

      /*
       * START TAG
       */

      const startTagSliceResult = sliceStart({
        text: line,
        regex: START_TAG_REGEX,
      });

      if (startTagSliceResult.match) {
        const startTagNameSliceResult = sliceStart({
          text: startTagSliceResult.match,
          regex: START_TAG_NAME_REGEX,
        });

        if (startTagNameSliceResult.match) {
          const tagName = startTagNameSliceResult.match;
          const attributes: Record<string, string> = {};

          const tag = startTagSliceResult.match;
          [...tag.matchAll(START_TAG_ATTRIBUTES_REGEX)].forEach((match) => {
            const name = match[1];
            const value = match[3];
            attributes[name] = value;
          });

          logger.debug('parsed start tag', { tagName, attributes });
          this.processTagStart(tagName, attributes);

          if (tag.endsWith('/>')) {
            this.processTagEnd();
          }
        }

        line = startTagSliceResult.remaining;
        continue;
      }

      // Should never get here...
      throw new Error(`[GAME:PARSER:UNPARSED:LINE] ${line}`);
    }

    if (this.gameText.length > 0) {
      this.emitTextGameEvent();
    }
  }

  protected processText(text: string): void {
    const activeTag = this.getActiveTag();
    const { id: tagId = '', name: tagName = '' } = activeTag ?? {};

    if (this.activeTags.length === 0) {
      this.gameText += text;
      return;
    }

    // This is a style information tag about the current room description.
    // The text is intended for the player.
    // For example, `<preset id='roomDesc'>The hustle...</preset>`.
    // In this example, the text would be 'The hustle...'.
    if (tagName === 'preset' && tagId === 'roomDesc') {
      this.gameText += text;
      return;
    }

    // This is information about the current room.
    // The text is intended for the player.
    // For example, `<component id='room desc'>The hustle...</component>`.
    // In this example, the text would be 'The hustle...'.
    if (
      ['component', 'compDef'].includes(tagName) &&
      tagId?.startsWith('room ')
    ) {
      this.gameText += text;
      return;
    }

    // This is a hyperlink, we only need the text.
    // For example, `<a href='https://drwiki.play.net'>Elanthipedia</a>`.
    // In this example, the text would be 'Elanthipedia'.
    if ('a' === tagName) {
      this.gameText += text;
      return;
    }

    // This is a movement direction in text destined for the player.
    // For example, `Obvious paths: <d>north</d>, <d>east</d>.`
    // In this example, the text would be either 'north' or 'east'.
    if ('d' === tagName) {
      this.gameText += text;
      return;
    }

    // This is a periodic terminal-like prompt that appears in the game.
    // For example, `<prompt time="1703804031">&gt;</prompt>`
    // In this example, the text would be '&gt;'.
    if ('prompt' === tagName) {
      this.gameText += text;
      return;
    }
  }

  protected processTagStart(
    tagName: string,
    attributes: Record<string, string>
  ): void {
    this.activeTags.push({
      id: attributes.id,
      name: tagName,
      attributes,
    });

    // Example: `<clearStream id="inv"/>`
    if ('clearStream' === tagName) {
      this.emitClearStreamGameEvent(attributes.id);
    }
  }

  protected processTagEnd(): void {
    const activeTag = this.getActiveTag();
    const { id: tagId = '', name: tagName = '' } = activeTag ?? {};

    if (
      ['component', 'compDef'].includes(tagName) &&
      tagId.startsWith('room ')
    ) {
      this.emitRoomGameEvent(tagId);
      this.gameText = '';
    }

    if (this.activeTags.length > 0) {
      this.activeTags.pop();
    }
  }

  protected getActiveTag(): { id?: string; name: string } | undefined {
    return this.activeTags[this.activeTags.length - 1];
  }

  protected emitTextGameEvent(): void {
    this.gameEventsSubject$.next({
      type: GameEventType.TEXT,
      text: unescapeEntities(this.gameText),
    });
  }

  protected emitPushBoldGameEvent(): void {
    this.gameEventsSubject$.next({
      type: GameEventType.PUSH_BOLD,
    });
  }

  protected emitPopBoldGameEvent(): void {
    this.gameEventsSubject$.next({
      type: GameEventType.POP_BOLD,
    });
  }

  protected emitTextOutputClassGameEvent(className: string): void {
    this.gameEventsSubject$.next({
      type: GameEventType.TEXT_OUTPUT_CLASS,
      textOutputClass: className,
    });
  }

  protected emitTextStylePresetGameEvent(presetName: string): void {
    this.gameEventsSubject$.next({
      type: GameEventType.TEXT_STYLE_PRESET,
      textStylePreset: presetName,
    });
  }

  protected emitIndicatorGameEvent(indicator: IndicatorType | string): void {
    this.gameEventsSubject$.next({
      type: GameEventType.INDICATOR,
      indicator: indicator as IndicatorType,
    });
  }

  protected emitSpellGameEvent(spell: string): void {
    this.gameEventsSubject$.next({
      type: GameEventType.SPELL,
      spell,
    });
  }

  protected emitLeftHandGameEvent(item: string): void {
    this.gameEventsSubject$.next({
      type: GameEventType.LEFT_HAND,
      item,
    });
  }

  protected emitRightHandGameEvent(item: string): void {
    this.gameEventsSubject$.next({
      type: GameEventType.RIGHT_HAND,
      item,
    });
  }

  protected emitClearStreamGameEvent(streamId: string): void {
    this.gameEventsSubject$.next({
      type: GameEventType.CLEAR_STREAM,
      streamId,
    });
  }

  protected emitPushStreamGameEvent(streamId: string): void {
    this.gameEventsSubject$.next({
      type: GameEventType.PUSH_STREAM,
      streamId,
    });
  }

  protected emitPopStreamGameEvent(): void {
    this.gameEventsSubject$.next({
      type: GameEventType.POP_STREAM,
    });
  }

  protected emitCompassGameEvent(directions: Array<string>): void {
    this.gameEventsSubject$.next({
      type: GameEventType.COMPASS,
      directions,
    });
  }

  protected emitVitalsGameEvent(options: {
    vitalId: string;
    value: number;
  }): void {
    const { vitalId, value } = options;
    this.gameEventsSubject$.next({
      type: GameEventType.VITALS,
      vitalId,
      value,
    });
  }

  protected emitExperienceGameEvent(options: {
    skill: string;
    rank: number;
    percent: number;
    mindState: string;
  }): void {
    const { skill, rank, percent, mindState } = options;
    this.gameEventsSubject$.next({
      type: GameEventType.EXPERIENCE,
      skill,
      rank,
      percent,
      mindState,
    });
  }

  protected emitRoomGameEvent(tagId: string): void {
    const roomProperty = ROOM_ID_TO_EVENT_PROPERTY_MAP[tagId];
    if (roomProperty) {
      this.gameEventsSubject$.next({
        type: GameEventType.ROOM,
        [roomProperty]: unescapeEntities(this.gameText),
      });
    }
  }

  protected emitServerTimeGameEvent(time: number): void {
    this.gameEventsSubject$.next({
      type: GameEventType.SERVER_TIME,
      time,
    });
  }

  protected emitRoundTimeGameEvent(time: number): void {
    this.gameEventsSubject$.next({
      type: GameEventType.ROUND_TIME,
      time,
    });
  }
}
