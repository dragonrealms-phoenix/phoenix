/**
 * Events emitted by the game parser of data received from the game socket.
 */
export type GameEvent =
  | TextGameEvent
  | PushBoldGameEvent
  | PopBoldGameEvent
  | TextOutputClassGameEvent
  | TextStylePresetGameEvent
  | IndicatorGameEvent
  | SpellGameEvent
  | HandGameEvent
  | ClearStreamGameEvent
  | PushStreamGameEvent
  | PopStreamGameEvent
  | CompassGameEvent
  | VitalsGameEvent
  | ExperienceGameEvent
  | RoomGameEvent
  | ServerTimeGameEvent
  | RoundTimeGameEvent
  | CastTimeGameEvent;

export interface GameEventBase {
  /**
   * Unique identifier for this game event.
   */
  eventId: string;
  /**
   * Indicates the type of game event.
   */
  type: GameEventType;
}

/**
 * Indicates text to display to the player.
 * Note that previous game events may indicate how the
 * text should be styled and to which window to display it.
 */
export interface TextGameEvent extends GameEventBase {
  type: GameEventType.TEXT;
  text: string;
}

/**
 * <pushBold/>
 */
export interface PushBoldGameEvent extends GameEventBase {
  type: GameEventType.PUSH_BOLD;
}

/**
 * <popBold/>
 */
export interface PopBoldGameEvent extends GameEventBase {
  type: GameEventType.POP_BOLD;
}

/**
 * <output class="mono"/>
 * <output class=""/>
 */
export interface TextOutputClassGameEvent extends GameEventBase {
  type: GameEventType.TEXT_OUTPUT_CLASS;
  textOutputClass: string;
}

/**
 * <style id="roomName" />[Provincial Bank, Teller]<style id=""/>
 * <preset id='roomDesc'>A neat row...</preset> You also see ...
 * Obvious exits: <d>out</d>.
 */
export interface TextStylePresetGameEvent extends GameEventBase {
  type: GameEventType.TEXT_STYLE_PRESET;
  textStylePreset: string;
}

/**
 * <indicator id='IconBLEEDING' visible='n'/>
 */
export interface IndicatorGameEvent extends GameEventBase {
  type: GameEventType.INDICATOR;
  indicator: IndicatorType;
  active: boolean;
}

/**
 * <spell>Fire Shards</spell>
 */
export interface SpellGameEvent extends GameEventBase {
  type: GameEventType.SPELL;
  spell: string;
}

/**
 * <left>Empty</left>
 * <right>red backpack</right>
 */
export interface HandGameEvent extends GameEventBase {
  type: GameEventType.LEFT_HAND | GameEventType.RIGHT_HAND;
  item: string;
}

/**
 * <clearStream id='inv'/>
 */
export interface ClearStreamGameEvent extends GameEventBase {
  type: GameEventType.CLEAR_STREAM;
  streamId: string;
}

/**
 * <pushStream id='experience'/>
 */
export interface PushStreamGameEvent extends GameEventBase {
  type: GameEventType.PUSH_STREAM;
  streamId: string;
}

/**
 * <popStream/>
 */
export interface PopStreamGameEvent extends GameEventBase {
  type: GameEventType.POP_STREAM;
}

/**
 * <compass><dir value="e"/><dir value="sw"/><dir value="out"/></compass>
 */
export interface CompassGameEvent extends GameEventBase {
  type: GameEventType.COMPASS;
  directions: Array<string>; // e.g. 'nw', 'n', 'up', or 'out'
}

/**
 * <progressBar id='mana' value='100'/>
 */
export interface VitalsGameEvent extends GameEventBase {
  type: GameEventType.VITALS;
  vitalId: string; // health, mana, concentration, spirit, stamina
  value: number; // 0-100 (percentage)
}

/**
 * https://elanthipedia.play.net/Experience#Mindstates
 *
 * <component id='exp Attunement'>      Attunement:    1 46% attentive    </component>
 * <component id='exp Attunement'><preset id='whisper'>      Attunement:    1 46% attentive    </preset></component>
 */
export interface ExperienceGameEvent extends GameEventBase {
  type: GameEventType.EXPERIENCE;
  skill: string; // e.g. Attunement, First Aid, etc.
  rank: number; // integer of the skill's rank
  percent: number; // 0-99 (percentage) towards next rank
  mindState: string; // e.g. 'clear', 'pondering', 'mind lock', etc.
}

/**
 * One or more properties might be specified.
 * If defined then that property has changed.
 * If undefined then that property has not changed.
 *
 * <streamWindow id='room' title='Room' subtitle=" - [The Crossing, Hodierna Way]"/>
 * <component id='room desc'>The hustle...</component>
 * <component id='room objs'>You also see ...</component>
 * <component id='room players'>Also here: Katoak.</component>
 * <component id='room exits'>Obvious paths: <d>east</d>, <d>southwest</d>, <d>northwest</d>.<compass></compass></component>
 */
export interface RoomGameEvent extends GameEventBase {
  type: GameEventType.ROOM;
  roomName?: string;
  roomDescription?: string;
  roomObjects?: string;
  roomPlayers?: string;
  roomExits?: string;
}

/**
 * <prompt time="1703617000">&gt;</prompt>
 */
export interface ServerTimeGameEvent extends GameEventBase {
  type: GameEventType.SERVER_TIME;
  time: number;
}

/**
 * <roundTime value='1703617016'/>
 */
export interface RoundTimeGameEvent extends GameEventBase {
  type: GameEventType.ROUND_TIME;
  time: number;
}

/**
 * <castTime value='1703617016'/>
 */
export interface CastTimeGameEvent extends GameEventBase {
  type: GameEventType.CAST_TIME;
  time: number;
}

export enum GameEventType {
  /**
   * Text to display to the player.
   */
  TEXT = 'TEXT',
  /**
   * Indicates all following text should be styled as bold.
   * Let the user choose their font style in their preferences.
   */
  PUSH_BOLD = 'PUSH_BOLD',
  /**
   * Indicates all following text should no longer be styled as bold.
   */
  POP_BOLD = 'POP_BOLD',
  /**
   * Usually indicates if the text should be styled as monospaced or not.
   */
  TEXT_OUTPUT_CLASS = 'TEXT_OUTPUT_CLASS',
  /**
   * Indicates if the text should be styled per a named preset.
   * For example, 'roomName' or 'roomDesc' or 'whisper', etc.
   */
  TEXT_STYLE_PRESET = 'TEXT_STYLE_PRESET',
  /**
   * Indicates if the character is bleeding, poisoned, etc.
   */
  INDICATOR = 'INDICATOR',
  /**
   * Name of the spell the character is preparing.
   */
  SPELL = 'SPELL',
  /**
   * The item in the character's left hand.
   */
  LEFT_HAND = 'LEFT_HAND',
  /**
   * The item in the character's right hand.
   */
  RIGHT_HAND = 'RIGHT_HAND',
  /**
   * Blank out the text for the game window specified by the stream id.
   * For example, when overwriting the inventory or experience windows.
   */
  CLEAR_STREAM = 'CLEAR_STREAM',
  /**
   * Redirect all text to the game window specified by the stream id.
   */
  PUSH_STREAM = 'PUSH_STREAM',
  /**
   * Stop redirecting all text to the game window specified by the stream id.
   */
  POP_STREAM = 'POP_STREAM',
  /**
   * Indicates the obvious exit directions from the current room.
   * For example, 'Obvious exits: north, east, up, out.'
   */
  COMPASS = 'COMPASS',
  /**
   * Indicates one of the character's vitals.
   * For example, health, energy (mana, conc. or inner fire), stamina, spirit.
   */
  VITALS = 'VITALS',
  /**
   * Indicates a change in the character's experience for a specific skill.
   */
  EXPERIENCE = 'EXPERIENCE',
  /**
   * Indicates a change in the current room.
   * For example, the name, description, attendees, etc.
   */
  ROOM = 'ROOM',
  /**
   * Tells us the game server time.
   * Use this in round time and cast time calculations.
   */
  SERVER_TIME = 'SERVER_TIME',
  /**
   * Indicates the character took an action that they must now wait
   * until the game server time reaches the specified roundtime.
   * Subtracting the roundtime from the current game time tells you
   * the number of seconds to wait.
   */
  ROUND_TIME = 'ROUND_TIME',
  /**
   * Indicates the character is preparing a spell.
   * They must wait until the game server time reaches the specified casttime
   * to be fully prepared to cast the spell.
   * Subtracting the casttime from the current game time tells you
   * the number of seconds to wait.
   */
  CAST_TIME = 'CAST_TIME',
}

export enum IndicatorType {
  DEAD = 'DEAD', // character is dead

  STANDING = 'STANDING', // character is standing
  KNEELING = 'KNEELING', // character is kneeling
  SITTING = 'SITTING', // character is sitting
  PRONE = 'PRONE', // character is lying down

  BLEEDING = 'BLEEDING', // character is bleeding
  DISEASED = 'DISEASED', // character is diseased
  POISONED = 'POISONED', // character is poisoned

  STUNNED = 'STUNNED', // character is stunned and can't do anything
  WEBBED = 'WEBBED', // character is webbed and can't move

  JOINED = 'JOINED', // character is joined to and following another character

  HIDDEN = 'HIDDEN', // character is hidden
  INVISIBLE = 'INVISIBLE', // character is invisible
}

/**
 * Map of mind states to their learning rate (0-34).
 * https://elanthipedia.play.net/Experience#Mindstates
 */
export enum ExperienceMindState {
  CLEAR = 0,
  DABBLING = 1,
  PERUSING = 2,
  LEARNING = 3,
  THOUGHTFUL = 4,
  THINKING = 5,
  CONSIDERING = 6,
  PONDERING = 7,
  RUMINATING = 8,
  CONCENTRATING = 9,
  ATTENTIVE = 10,
  DELIBERATIVE = 11,
  INTERESTED = 12,
  EXAMINING = 13,
  UNDERSTANDING = 14,
  ABSORBING = 15,
  INTRIGUED = 16,
  SCRUTINIZING = 17,
  ANALYZING = 18,
  STUDIOUS = 19,
  FOCUSED = 20,
  VERY_FOCUSED = 21,
  ENGAGED = 22,
  VERY_ENGAGED = 23,
  COGITATING = 24,
  FASCINATED = 25,
  CAPTIVATED = 26,
  ENGROSSED = 27,
  RIVETED = 28,
  VERY_RIVETED = 29,
  RAPT = 30,
  VERY_RAPT = 31,
  ENTHRALLED = 32,
  NEARLY_LOCKED = 33,
  MIND_LOCK = 34,
}

export interface GameConnectMessage {
  accountName: string;
  characterName: string;
  gameCode: string;
}

export interface GameDisconnectMessage {
  accountName: string;
  characterName: string;
  gameCode: string;
}

export interface GameErrorMessage {
  error: Error;
}

export interface GameEventMessage {
  gameEvent: GameEvent;
}

export interface GameCommandMessage {
  command: string;
}
