import * as rxjs from 'rxjs';
import { sliceStart, unescapeEntities } from '../../common/string';
import type { Maybe } from '../../common/types';
import { createLogger } from '../logger';
import type {
  ExperienceGameEvent,
  GameEvent,
  GameParser,
  RoomGameEvent,
} from './game.types';
import { GameEventType, IndicatorType } from './game.types';

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
  'room creatures': 'roomCreatures',
  'room objects': 'roomObjects', // sometimes the tag id is long
  'room objs': 'roomObjects', // sometimes it's short
  'room players': 'roomPlayers',
  'room exits': 'roomExits',
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

const logger = createLogger('game:parser');

/**
 * Inspired by Lich's XMLParser.
 * https://github.com/elanthia-online/lich-5/blob/master/lib/xmlparser.rb
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

  /**
   * To mitigate sending multiple blank newlines.
   * If the previous sent text was '\n' and the next text is '\n',
   * then we'll skip emitting the second newline.
   */
  private previousGameText: string;

  constructor() {
    this.gameEventsSubject$ = new rxjs.Subject<GameEvent>();
    this.activeTags = [];
    this.compassDirections = [];
    this.gameText = '';
    this.previousGameText = '';
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
        logger.debug('game socket stream completed');
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
    // Ensure we start fresh with each line.
    this.consumeGameText();

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
      const previousWasNewline = this.previousGameText === '\n';
      const currentIsNewline = this.gameText === '\n';

      // Avoid sending multiple blank newlines.
      if (previousWasNewline && !currentIsNewline) {
        this.emitTextGameEvent(this.consumeGameText());
      }
    }
  }

  protected processText(text: string): void {
    const { id: tagId = '', name: tagName = '' } = this.getActiveTag() ?? {};

    logger.debug('processing text', { tagId, tagName, text });

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
      case 'compDef':
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
        // Example: `<a href='https://drwiki.play.net'>Elanthipedia</a>`.
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
    }
  }

  protected processTagStart(
    tagName: string,
    attributes: Record<string, string>
  ): void {
    logger.debug('processing tag start', { tagName, attributes });

    this.activeTags.push({
      id: attributes.id,
      name: tagName,
      attributes,
    });

    switch (tagName) {
      case 'pushBold': // <pushBold/>
        this.emitPushBoldGameEvent();
        break;
      case 'popBold': // <popBold/>
        this.emitPopBoldGameEvent();
        break;
      case 'output': // <output class="mono"/>
        this.emitTextOutputClassGameEvent(attributes.class);
        break;
      case 'style': // <style id="roomName"/>
      case 'preset': // <preset id="roomDesc">...</preset>
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
      case 'compass': // <compass>...</compass>
        this.compassDirections = [];
        break;
      case 'dir': // <dir value="e"/>
        this.compassDirections.push(attributes.value);
        break;
      case 'vitals': // <progressBar id="mana" value="100"/>
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
    }
  }

  protected processTagEnd(): void {
    const { id: tagId = '', name: tagName = '' } = this.getActiveTag() ?? {};

    logger.debug('processing tag end', { tagId, tagName });

    switch (tagName) {
      case 'compDef':
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
        else if (tagId.startsWith('exp ')) {
          this.emitExperienceGameEvent(
            this.parseToExperienceGameEvent(this.consumeGameText())
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
   * Parses an experience line of text into an experience game event.
   *
   * Input:
   *  'Attunement: 1 46% attentive'
   *
   * Output:
   *  {
   *    type: GameEventType.EXPERIENCE,
   *    skill: 'Attunement',
   *    rank: 1,
   *    percent: 46,
   *    mindState: 'attentive'
   *  }
   */
  protected parseToExperienceGameEvent(line: string): ExperienceGameEvent {
    const matchResult = line?.trim()?.match(EXPERIENCE_REGEX);
    if (matchResult) {
      return {
        type: GameEventType.EXPERIENCE,
        skill: matchResult.groups?.skill ?? '',
        rank: parseInt(matchResult.groups?.rank ?? '0'),
        percent: parseInt(matchResult.groups?.percent ?? '0'),
        mindState: matchResult.groups?.mindstate ?? '',
      };
    }
    return {
      type: GameEventType.EXPERIENCE,
      skill: '',
      rank: 0,
      percent: 0,
      mindState: '',
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

  protected isAncestorTag(tagName: string): boolean {
    return this.getAncestorTag(tagName) !== undefined;
  }

  /**
   * Returns the current value of game text then clears it.
   * Moves the old value to the previous game text variable.
   * This is a convenience method for performing these two steps.
   */
  protected consumeGameText(): string {
    const oldValue = this.gameText; // what we're consuming
    const newValue = ''; // what to reset to

    // Track the previous consumed game text.
    // This is how we mitigate sending multiple blank newlines.
    this.previousGameText = oldValue;
    this.gameText = newValue;

    return oldValue;
  }

  protected emitTextGameEvent(text: string): void {
    this.emitGameEvent({
      type: GameEventType.TEXT,
      text: unescapeEntities(text),
    });
  }

  protected emitPushBoldGameEvent(): void {
    this.emitGameEvent({
      type: GameEventType.PUSH_BOLD,
    });
  }

  protected emitPopBoldGameEvent(): void {
    this.emitGameEvent({
      type: GameEventType.POP_BOLD,
    });
  }

  protected emitTextOutputClassGameEvent(className: string): void {
    this.emitGameEvent({
      type: GameEventType.TEXT_OUTPUT_CLASS,
      textOutputClass: className,
    });
  }

  protected emitTextStylePresetGameEvent(presetName: string): void {
    this.emitGameEvent({
      type: GameEventType.TEXT_STYLE_PRESET,
      textStylePreset: presetName,
    });
  }

  protected emitIndicatorGameEvent(options: {
    tagId: string;
    active: boolean;
  }): void {
    const { tagId, active } = options;
    const indicator = INDICATOR_ID_TO_TYPE_MAP[tagId];
    if (indicator) {
      this.emitGameEvent({
        type: GameEventType.INDICATOR,
        indicator,
        active,
      });
    }
  }

  protected emitSpellGameEvent(spell: string): void {
    this.emitGameEvent({
      type: GameEventType.SPELL,
      spell: unescapeEntities(spell),
    });
  }

  protected emitLeftHandGameEvent(item: string): void {
    this.emitGameEvent({
      type: GameEventType.LEFT_HAND,
      item: unescapeEntities(item),
    });
  }

  protected emitRightHandGameEvent(item: string): void {
    this.emitGameEvent({
      type: GameEventType.RIGHT_HAND,
      item: unescapeEntities(item),
    });
  }

  protected emitClearStreamGameEvent(streamId: string): void {
    this.emitGameEvent({
      type: GameEventType.CLEAR_STREAM,
      streamId: streamId,
    });
  }

  protected emitPushStreamGameEvent(streamId: string): void {
    this.emitGameEvent({
      type: GameEventType.PUSH_STREAM,
      streamId: streamId,
    });
  }

  protected emitPopStreamGameEvent(): void {
    this.emitGameEvent({
      type: GameEventType.POP_STREAM,
    });
  }

  protected emitCompassGameEvent(directions: Array<string>): void {
    this.emitGameEvent({
      type: GameEventType.COMPASS,
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
    if (roomProperty) {
      this.emitGameEvent({
        type: GameEventType.ROOM,
        [roomProperty]: unescapeEntities(roomText),
      });
    }
  }

  protected emitServerTimeGameEvent(time: number): void {
    this.emitGameEvent({
      type: GameEventType.SERVER_TIME,
      time,
    });
  }

  protected emitRoundTimeGameEvent(time: number): void {
    this.emitGameEvent({
      type: GameEventType.ROUND_TIME,
      time,
    });
  }

  protected emitGameEvent(gameEvent: GameEvent): void {
    logger.debug('emitting game event', { gameEvent });
    this.gameEventsSubject$.next(gameEvent);
  }
}
