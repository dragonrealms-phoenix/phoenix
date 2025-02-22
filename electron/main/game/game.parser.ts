// Inspired by Lich's XMLParser.
// https://github.com/elanthia-online/lich-5/blob/master/lib/xmlparser.rb

import * as rxjs from 'rxjs';
import { v4 as uuid } from 'uuid';
import type {
  ExperienceGameEvent,
  GameEvent,
  RoomGameEvent,
} from '../../common/game/types.js';
import { GameEventType, IndicatorType } from '../../common/game/types.js';
import {
  sliceStart,
  unescapeEntities,
} from '../../common/string/string.utils.js';
import type { Maybe } from '../../common/types.js';
import { gameParserLogger as logger } from './logger.js';
import type { GameParser } from './types.js';

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
 * Matches the skill, rank, percent, and mindstate from a
 * line of experience information.
 * https://regex101.com/r/MO3pml/1
 */
const EXPERIENCE_REGEX =
  /^\s*(?<skill>[\w\s]+)\s*:\s*(?<rank>\d+)\s+(?<percent>\d+)%\s+(?<mindstate>[\w\s]+)/;

/**
 * Map of the component ids that describe a part of the current room
 * to their room game event property name.
 * Example: `<component id='room desc'>The hustle...</component>`
 */
const ROOM_ID_TO_EVENT_PROPERTY_MAP: Record<string, keyof RoomGameEvent> = {
  'room name': 'roomName',
  'room desc': 'roomDescription',
  'room objects': 'roomObjects', // sometimes the tag id is long
  'room objs': 'roomObjects', // sometimes it's short
  'room players': 'roomPlayers',
  'room exits': 'roomExits',
  'room extra': 'roomExtra',
};

/**
 * Map of the indicator ids to their indicator type.
 * Example: `<indicator id='IconBLEEDING' visible='n'/>`
 */
const INDICATOR_ID_TO_TYPE_MAP: Record<string, IndicatorType> = {
  IconDEAD: IndicatorType.DEAD,

  IconSTANDING: IndicatorType.STANDING,
  IconKNEELING: IndicatorType.KNEELING,
  IconSITTING: IndicatorType.SITTING,
  IconPRONE: IndicatorType.PRONE,

  IconBLEEDING: IndicatorType.BLEEDING,
  IconDISEASED: IndicatorType.DISEASED,
  IconPOISONED: IndicatorType.POISONED,

  IconSTUNNED: IndicatorType.STUNNED,
  IconWEBBED: IndicatorType.WEBBED,

  IconJOINED: IndicatorType.JOINED,

  IconHIDDEN: IndicatorType.HIDDEN,
  IconINVISIBLE: IndicatorType.INVISIBLE,
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
   * When parsing a <compass> tag, these are the directions we find.
   * Example: `<compass><dir value="e"/><dir value="sw"/></compass>`
   */
  private compassDirections: Array<string>;

  /**
   * Any text that should be emitted as a game event.
   * This might be a room description, inventory, whispers, etc.
   * Is set, updated, cleared, and emitted based on the game events.
   */
  private gameText: string;

  constructor() {
    this.gameEventsSubject$ = new rxjs.Subject<GameEvent>();
    this.activeTags = [];
    this.compassDirections = [];
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
    logger.debug('subscribing to game socket stream');
    gameSocketStream
      .pipe(
        // The parsing logic used to be in the `next` method of the
        // subscribe method's options. However, errors thrown from there
        // are NOT handled by the `error` subscribe error callback. Doh!
        // Instead, that catches errors from the pipeline.
        // Therefore, moved the parsing logic to the pipeline.
        rxjs.map((socketData) => {
          logger.trace('parsing game socket data', { socketData });
          const lines = this.convertSocketDataToLines(socketData);
          this.parseLines(lines);
        })
      )
      .subscribe({
        error: (error) => {
          logger.error('game socket stream error', { error });
          this.gameEventsSubject$.error(error);
        },
        complete: () => {
          logger.debug('game socket stream completed');
          this.gameEventsSubject$.complete();
        },
      });
    return this.gameEventsSubject$.asObservable();
  }

  protected convertSocketDataToLines(socketData: string): Array<string> {
    // Standardize on one way of representing newlines.
    socketData = socketData.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Standardize on one way of representing whitespace.
    socketData = socketData.replace(/\t/g, ' ');

    // Remove non-printable characters.
    // https://en.wikipedia.org/wiki/ASCII#Control_code_table
    // eslint-disable-next-line no-control-regex
    socketData = socketData.replace(/[\x00-\x09]|[\x0B-\x1F]|[\x7F]/g, '');

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
    // Ensure we start fresh with each line.
    this.gameText = '';

    logger.trace('parsing line', { line });

    while (line.length > 0) {
      logger.trace('remaining line fragment', { line });

      /*
       * TEXT
       */

      const textSliceResult = sliceStart({
        text: line,
        regex: TEXT_REGEX,
      });

      if (textSliceResult.match) {
        logger.trace('parsed text', { text: textSliceResult.match });
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
          logger.trace('parsed end tag', { tagName });
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

          logger.trace('parsed start tag', { tagName, attributes });
          this.processTagStart(tagName, attributes);

          if (tag.endsWith('/>')) {
            this.processTagEnd();
          }
        }

        line = startTagSliceResult.remaining;
        continue;
      }

      // Should never get here...
      throw new Error(`[GAME:PARSER:UNPARSED:LINE] ${line?.trim()}`);
    }

    if (this.gameText.length > 0) {
      this.emitTextGameEvent(this.consumeGameText());
    }
  }

  protected processText(text: string): void {
    const { id: tagId = '', name: tagName = '' } = this.getActiveTag() ?? {};

    logger.trace('processing text', {
      text,
      tagId,
      tagName,
      activeTags: this.activeTags,
    });

    // There are no tags so just keep collecting up the text.
    if (this.activeTags.length === 0) {
      this.gameText += text;
      return;
    }

    switch (tagName) {
      case 'preset':
        // This is a style information tag about the current room description.
        // Example: `<preset id='roomDesc'>The hustle...</preset>`.
        // In this example, the text would be 'The hustle...'.
        if (tagId === 'roomDesc') {
          this.gameText += text;
        }
        // This is a style information tag about talking or thinking.
        // Example: `<preset id='speech'>You say</preset>, "Hello."`
        else if (['speech', 'whisper', 'thought'].includes(tagId)) {
          this.gameText += text;
        } else {
          const componentTag = this.getAncestorTag('component');
          // This is updated information about the character's experience.
          // I don't know why the component tag sometimes nests a preset tag.
          // Example: `<component id='exp Attunement'><preset id='whisper'>      Attunement:    1 46% attentive    </preset></component>`
          // In this example, the text would be '      Attunement:    1 46% attentive    '.
          if (componentTag?.id?.startsWith('exp ')) {
            this.gameText += text;
          }
        }
        break;
      case 'component':
        // This is updated information about the current room.
        // Example: `<component id='room desc'>The hustle...</component>`.
        // In this example, the text would be 'The hustle...'.
        if (tagId.startsWith('room ')) {
          this.gameText += text;
        }
        // This is updated information about the character's experience.
        // Example: `<component id='exp Attunement'>      Attunement:    1 46% attentive    </component>`.
        // In this example, the text would be '      Attunement:    1 46% attentive    '.
        else if (tagId.startsWith('exp ')) {
          this.gameText += text;
        }
        break;
      case 'a':
        // This is a hyperlink, we only need the text.
        // Example: `<a href='https://elanthipedia.play.net'>Elanthipedia</a>`
        // In this example, the text would be 'Elanthipedia'.
        this.gameText += text;
        break;
      case 'd':
        // This is a movement direction in text destined for the player.
        // Example: `Obvious paths: <d>north</d>, <d>east</d>.`
        // In this example, the text would be either 'north' or 'east'.
        this.gameText += text;
        break;
      case 'prompt':
        // This is a periodic terminal-like prompt that appears in the game.
        // Example: `<prompt time="1703804031">&gt;</prompt>`
        // In this example, the text would be '&gt;'.
        this.gameText += text;
        break;
      case 'spell':
        // This is a spell name.
        // Example: `<spell>Fire Shards</spell>`
        // In this example, the text would be 'Fire Shards'.
        this.gameText += text;
        break;
      case 'left':
        // This is the name of the item in the character's left hand.
        // Example: `<left>red backpack</left>`
        // In this example, the text would be 'red backpack'.
        this.gameText += text;
        break;
      case 'right':
        // This is the name of the item in the character's right hand.
        // Example: `<right>Empty</right>`
        // In this example, the text would be 'Empty'.
        this.gameText += text;
        break;
    }
  }

  protected processTagStart(
    tagName: string,
    attributes: Record<string, string>
  ): void {
    logger.trace('processing tag start', { tagName, attributes });

    this.activeTags.push({
      id: attributes.id,
      name: tagName,
      attributes,
    });

    switch (tagName) {
      case 'a': // <a href='https://elanthipedia.play.net'>Elanthipedia</a>
        this.gameText += `<a href="${attributes.href}" target="_blank">`;
        break;
      case 'pushBold': // <pushBold/>
        // If this is nested inside text then it is an inline text style.
        // For example, emphasizing a person's name.
        // "You also see <pushBold />a town guard<popBold />."
        // Otherwise emit a game event to turn on bold text.
        if (this.gameText.length > 0) {
          this.gameText += '<b>';
        } else {
          this.emitPushBoldGameEvent();
        }
        break;
      case 'popBold': // <popBold/>
        // If this is nested inside text then it is an inline text style.
        // For example, emphasizing a person's name.
        // "You also see <pushBold />a town guard<popBold />."
        // Otherwise emit a game event to turn off bold text.
        if (this.gameText.length > 0) {
          this.gameText += '</b>';
        } else {
          this.emitPopBoldGameEvent();
        }
        break;
      case 'output': // <output class="mono"/>
        this.emitTextOutputClassGameEvent(attributes.class);
        break;
      case 'style': // <style id="roomName"/>
      case 'preset': // <preset id="roomDesc|speech|whisper|thought">...</preset>
        this.emitTextStylePresetGameEvent(attributes.id);
        break;
      case 'indicator': // <indicator id='IconBLEEDING' visible='n'/>
        this.emitIndicatorGameEvent({
          tagId: attributes.id,
          active: attributes.visible === 'y',
        });
        break;
      case 'clearStream': // <clearStream id="percWindow"/>
        this.emitClearStreamGameEvent(attributes.id);
        break;
      case 'pushStream': // <pushStream id="percWindow"/>
        this.emitPushStreamGameEvent(attributes.id);
        break;
      case 'popStream': // <popStream/>
        this.emitPopStreamGameEvent();
        break;
      case 'streamWindow': // <streamWindow id='room' subtitle=' - [The Crossing, Hodierna Way]' />
        if (attributes.id === 'room') {
          this.emitRoomGameEvent({
            tagId: 'room name',
            roomText: attributes.subtitle?.slice(3) ?? '[unknown]',
          });
        }
        break;
      case 'compass': // <compass><dir value="e"/><dir value="sw"/></compass>
        this.compassDirections = [];
        break;
      case 'dir': // <dir value="e"/>
        this.compassDirections.push(attributes.value);
        break;
      case 'progressBar': // <progressBar id="mana" value="100"/>
        this.emitVitalsGameEvent({
          vitalId: attributes.id,
          value: parseInt(attributes.value),
        });
        break;
      case 'prompt': // <prompt time="1703804031">&gt;</prompt>
        this.emitServerTimeGameEvent(parseInt(attributes.time));
        break;
      case 'roundTime': // <roundTime value='1703617016'/>
        this.emitRoundTimeGameEvent(parseInt(attributes.value));
        break;
      case 'castTime': // <castTime value='1703617016'/>
        this.emitCastTimeGameEvent(parseInt(attributes.value));
        break;
    }
  }

  protected processTagEnd(): void {
    const {
      id: tagId = '',
      name: tagName = '',
      attributes = {},
    } = this.getActiveTag() ?? {};

    logger.trace('processing tag end', {
      tagId,
      tagName,
      attributes,
      gameText: this.gameText,
      activeTags: this.activeTags,
    });

    switch (tagName) {
      case 'a':
        // Close the hyperlink because we are at the end of the tag.
        // Example: `<a href='https://elanthipedia.play.net'>Elanthipedia</a>`
        this.gameText += `</a>`;
        break;
      case 'component':
        // Emit the room info because we are at the end of the tag.
        // Example: `<component id='room desc'>The hustle...</component>`
        if (tagId.startsWith('room ')) {
          this.emitRoomGameEvent({
            tagId,
            roomText: this.consumeGameText(),
          });
        }
        // Emit the experience info because we are at the end of the tag.
        // Example: `<component id='exp Attunement'>      Attunement:    1 46% attentive    </component>`
        // Example: `<component id='exp Attunement'></component>` (empty)
        else if (tagId.startsWith('exp ')) {
          this.emitExperienceGameEvent(
            this.parseToExperienceGameEvent({
              tagId,
              expText: this.consumeGameText(),
            })
          );
        }
        break;
      case 'preset':
        // Turn off the text style because we are at the end of the tag.
        // Example: `<preset id='roomDesc'>A neat row...</preset>`.
        this.emitTextStylePresetGameEvent('');
        break;
      case 'compass':
        // Emit the compass directions because we are at the end of the tag.
        // Example: `<compass><dir value="e"/><dir value="sw"/></compass>`
        this.emitCompassGameEvent(this.compassDirections);
        this.compassDirections = [];
        break;
      case 'spell':
        // Emit the spell because we are at the end of the tag.
        // Example: `<spell>Fire Shards</spell>`
        this.emitSpellGameEvent(this.consumeGameText());
        break;
      case 'left':
        // Emit the left hand item because we are at the end of the tag.
        // Example: `<left>red backpack</left>`
        this.emitLeftHandGameEvent(this.consumeGameText());
        break;
      case 'right':
        // Emit the right hand item because we are at the end of the tag.
        // Example: `<right>Empty</right>`
        this.emitRightHandGameEvent(this.consumeGameText());
        break;
    }

    if (this.activeTags.length > 0) {
      this.activeTags.pop();
    }
  }

  /**
   * Parses a component's tag id into an experience skill name.
   * Parses an experience line of text into an experience game event.
   *
   * Tag ID Input:
   *  'exp Attunement'
   *
   * Line Input:
   *  'Attunement: 1 46% attentive'
   *
   * Event Output:
   *  {
   *    type: GameEventType.EXPERIENCE,
   *    skill: 'Attunement',
   *    rank: 1,
   *    percent: 46,
   *    mindState: 'attentive'
   *  }
   */
  protected parseToExperienceGameEvent(options: {
    /**
     * The tag id of the component that contains the experience information.
     * Example: 'exp Attunement'
     */
    tagId: string;
    /**
     * The line of text that contains the experience information.
     * This may be blank if the character has no experience for the skill.
     * Example: 'Attunement: 1 46% attentive'
     * Example: ''
     */
    expText: string;
  }): ExperienceGameEvent {
    const { tagId, expText } = options;
    const matchResult = expText?.trim()?.match(EXPERIENCE_REGEX);
    if (matchResult) {
      return {
        type: GameEventType.EXPERIENCE,
        eventId: uuid(),
        skill: matchResult.groups?.skill ?? 'PARSE_ERROR',
        rank: parseInt(matchResult.groups?.rank ?? '0'),
        percent: parseInt(matchResult.groups?.percent ?? '0'),
        mindState: matchResult.groups?.mindstate ?? 'clear',
      };
    }
    return {
      type: GameEventType.EXPERIENCE,
      eventId: uuid(),
      skill: tagId.slice(4), // remove 'exp ' prefix
      rank: 0,
      percent: 0,
      mindState: 'clear',
    };
  }

  protected getActiveTag(): Maybe<Tag> {
    return this.activeTags[this.activeTags.length - 1];
  }

  protected getAncestorTag(tagName: string): Maybe<Tag> {
    return this.activeTags.find((tag) => {
      return tag.name === tagName;
    });
  }

  /**
   * Convenience method to return the current game text
   * then clear the variable for the next game event.
   *
   * Designed to be used with the `emitXyz` methods that use game text.
   */
  protected consumeGameText(): string {
    const gameText = this.gameText;
    this.gameText = '';
    return gameText;
  }

  protected emitTextGameEvent(text: string): void {
    this.emitGameEvent({
      type: GameEventType.TEXT,
      eventId: uuid(),
      text: unescapeEntities(text),
    });
  }

  protected emitPushBoldGameEvent(): void {
    this.emitGameEvent({
      type: GameEventType.PUSH_BOLD,
      eventId: uuid(),
    });
  }

  protected emitPopBoldGameEvent(): void {
    this.emitGameEvent({
      type: GameEventType.POP_BOLD,
      eventId: uuid(),
    });
  }

  protected emitTextOutputClassGameEvent(className: string): void {
    this.emitGameEvent({
      type: GameEventType.TEXT_OUTPUT_CLASS,
      eventId: uuid(),
      textOutputClass: className,
    });
  }

  protected emitTextStylePresetGameEvent(presetName: string): void {
    this.emitGameEvent({
      type: GameEventType.TEXT_STYLE_PRESET,
      eventId: uuid(),
      textStylePreset: presetName,
    });
  }

  protected emitIndicatorGameEvent(options: {
    tagId: string;
    active: boolean;
  }): void {
    const { tagId, active } = options;
    const indicator = INDICATOR_ID_TO_TYPE_MAP[tagId];
    this.emitGameEvent({
      type: GameEventType.INDICATOR,
      eventId: uuid(),
      indicator,
      active,
    });
  }

  protected emitSpellGameEvent(spell: string): void {
    this.emitGameEvent({
      type: GameEventType.SPELL,
      eventId: uuid(),
      spell: unescapeEntities(spell),
    });
  }

  protected emitLeftHandGameEvent(item: string): void {
    this.emitGameEvent({
      type: GameEventType.LEFT_HAND,
      eventId: uuid(),
      item: unescapeEntities(item),
    });
  }

  protected emitRightHandGameEvent(item: string): void {
    this.emitGameEvent({
      type: GameEventType.RIGHT_HAND,
      eventId: uuid(),
      item: unescapeEntities(item),
    });
  }

  protected emitClearStreamGameEvent(streamId: string): void {
    this.emitGameEvent({
      type: GameEventType.CLEAR_STREAM,
      eventId: uuid(),
      streamId: this.formatStreamId(streamId),
    });
  }

  protected emitPushStreamGameEvent(streamId: string): void {
    this.emitGameEvent({
      type: GameEventType.PUSH_STREAM,
      eventId: uuid(),
      streamId: this.formatStreamId(streamId),
    });
  }

  protected emitPopStreamGameEvent(): void {
    this.emitGameEvent({
      type: GameEventType.POP_STREAM,
      eventId: uuid(),
    });
  }

  protected emitCompassGameEvent(directions: Array<string>): void {
    this.emitGameEvent({
      type: GameEventType.COMPASS,
      eventId: uuid(),
      directions,
    });
  }

  protected emitVitalsGameEvent(options: {
    vitalId: string;
    value: number;
  }): void {
    const { vitalId, value } = options;
    this.emitGameEvent({
      type: GameEventType.VITALS,
      eventId: uuid(),
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
    this.emitGameEvent({
      type: GameEventType.EXPERIENCE,
      eventId: uuid(),
      skill,
      rank,
      percent,
      mindState,
    });
  }

  protected emitRoomGameEvent(options: {
    tagId: string;
    roomText: string;
  }): void {
    const { tagId, roomText } = options;
    const roomProperty = ROOM_ID_TO_EVENT_PROPERTY_MAP[tagId];
    this.emitGameEvent({
      type: GameEventType.ROOM,
      eventId: uuid(),
      [roomProperty]: unescapeEntities(roomText),
    });
  }

  protected emitServerTimeGameEvent(time: number): void {
    this.emitGameEvent({
      type: GameEventType.SERVER_TIME,
      eventId: uuid(),
      time,
    });
  }

  protected emitRoundTimeGameEvent(time: number): void {
    this.emitGameEvent({
      type: GameEventType.ROUND_TIME,
      eventId: uuid(),
      time,
    });
  }

  protected emitCastTimeGameEvent(time: number): void {
    this.emitGameEvent({
      type: GameEventType.CAST_TIME,
      eventId: uuid(),
      time,
    });
  }

  protected emitGameEvent(gameEvent: GameEvent): void {
    logger.trace('emitting game event', { gameEvent });
    this.gameEventsSubject$.next(gameEvent);
  }

  protected formatStreamId(streamId: string): string {
    // In the game, empty string is the main "catch all" stream.
    // In code and config, we want a non-empty string to refer to.
    // So, we use 'main' instead of ''.
    return streamId || 'main';
  }
}
