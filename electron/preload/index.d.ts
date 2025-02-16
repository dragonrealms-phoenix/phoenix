declare module 'common/account/types' {
  export interface Account {
    accountName: string;
  }
  export interface AccountWithPassword extends Account {
    accountPassword: string;
  }
  export interface Character {
    accountName: string;
    characterName: string;
    gameCode: string;
  }
}
declare module 'common/layout/types' {
  export interface Layout {
    /**
     * Layout configurations for the app window.
     * For example, where the app is displayed on the monitor.
     */
    window: WindowLayout;
    /**
     * Layout configurations for each game stream window.
     * For example, where and how the "main" or "room" streams are displayed.
     */
    items: Array<ItemLayout>;
  }
  /**
   * Layout configuration for the app window.
   * Coordinates are relative to the monitor screen.
   */
  export interface WindowLayout {
    /**
     * The x-coordinate of the app, in pixels.
     * This is the leftmost edge of the app.
     * This is the absolute position on the monitor screen.
     */
    x: number;
    /**
     * The y-coordinate of the app, in pixels.
     * This is the topmost edge of the app.
     * This is the absolute position on the monitor screen.
     */
    y: number;
    /**
     * The width of the app, in pixels.
     */
    width: number;
    /**
     * The height of the app, in pixels.
     */
    height: number;
  }
  /**
   * Layout configuration for a game stream.
   * Coordinates are relative to the grid item container.
   */
  export interface ItemLayout {
    /**
     * Game-specific identifier for the stream.
     * For example, "percWindow" for the active spells stream.
     * For the main catch-all stream, use "main" instead of empty string.
     */
    id: string;
    /**
     * Title to display for the stream in the app.
     * For example, "Active Spells" or "Inventory".
     */
    title: string;
    /**
     * Whether the stream is displayed in the app.
     * When false then this stream's content can be redirected to
     * another stream window using the `whenHiddenRedirectToId` property.
     */
    visible: boolean;
    /**
     * The x-coordinate of the stream window, in pixels.
     * Relative to where the streams are displayed within the app.
     * This is not the absolute position on the monitor screen.
     */
    x: number;
    /**
     * The y-coordinate of the stream window, in pixels.
     * Relative to where the streams are displayed within the app.
     * This is not the absolute position on the monitor screen.
     */
    y: number;
    /**
     * The width of the stream window, in pixels.
     */
    width: number;
    /**
     * The height of the stream window, in pixels.
     */
    height: number;
    /**
     * The font family to use for the stream content.
     * Example: 'Verdana' or 'Courier New'.
     */
    textFont: string;
    /**
     * The font size to use for the stream content, in pixels.
     * Example: 12.
     */
    textSize: number;
    /**
     * The color of the text in the stream content.
     * Can be color names (e.g. 'blue') or hex codes ('#00FF00').
     */
    foregroundColor: string;
    /**
     * The color of the background in the stream content.
     * Can be color names (e.g. 'blue') or hex codes ('#00FF00').
     */
    backgroundColor: string;
    /**
     * When this stream is not visible, redirect its content to another stream.
     * If that stream is also not visible, then it continues to be redirected
     * until either a visible stream in the chain is found or not.
     *
     * Example Scenarios
     * -----------------
     * Given the following configuration:
     *  - When StreamA is hidden it redirects to StreamB.
     *  - When StreamB is hidden it redirects to StreamC.
     *  - When StreamC is hidden it does not redirect anywhere.
     *
     * Then:
     *  - When all streams are visible, their content is displayed as normal.
     *  - When StreamA is hidden, its content is redirected to StreamB.
     *  - When StreamB is also hidden, both StreamA and StreamB redirect to StreamC.
     *  - When StreamC is also hidden, no content is displayed.
     */
    whenHiddenRedirectToId?: string | null;
  }
}
declare module 'common/logger/types' {
  /**
   * Originally, I used the `electron-log` module (https://github.com/megahertz/electron-log)
   * but at some point it stopped writing logs from renderer to a file.
   * Possibly related to https://github.com/megahertz/electron-log/issues/441.
   * After multiple attempts to fix it, I decided to implement my own logger.
   */
  export enum LogLevel {
    ERROR = 'error',
    WARN = 'warn',
    INFO = 'info',
    DEBUG = 'debug',
    TRACE = 'trace',
  }
  export type LogData = Record<string, any> & {
    scope?: string;
  };
  export type LogMessage = LogData & {
    scope: string;
    level: LogLevel;
    message: string;
    timestamp: Date;
  };
  /**
   * Shape of a logger function that always logs to a specific level.
   */
  export type LogLevelFunction = (message: string, data?: LogData) => void;
  /**
   * Shape of a logger function that can log to an arbitrary level.
   */
  export type LogFunction = (options: {
    level: LogLevel;
    message: string;
    data?: LogData;
  }) => void;
  export interface Logger {
    error: LogLevelFunction;
    warn: LogLevelFunction;
    info: LogLevelFunction;
    debug: LogLevelFunction;
    trace: LogLevelFunction;
    log: LogFunction;
  }
}
declare module 'common/types' {
  /**
   * Either a value or undefined.
   * https://non-traditional.dev/the-power-of-maybe-in-typescript
   */
  export type Maybe<T> = NonNullable<T> | undefined;
  export const convertToMaybe: <T>(value: T) => Maybe<T>;
  /**
   * Same as Partial<T> but goes deeper and makes Partial<T> all its properties and sub-properties.
   * https://github.com/typeorm/typeorm/blob/8ba742eb36586a21a918ed178208874a53ace3f9/src/common/DeepPartial.ts
   */
  export type DeepPartial<T> =
    | T
    | (T extends Array<infer U>
        ? Array<DeepPartial<U>>
        : T extends Map<infer K, infer V>
          ? Map<DeepPartial<K>, DeepPartial<V>>
          : T extends Set<infer M>
            ? Set<DeepPartial<M>>
            : T extends object
              ? {
                  [K in keyof T]?: DeepPartial<T[K]>;
                }
              : T);
  /**
   * Opposite of Readonly<T>.
   * https://stackoverflow.com/a/43001581/470818
   */
  export type Writeable<T> = {
    -readonly [P in keyof T]: T[P];
  };
  /**
   * Same as Writeable<T> but goes deeper and makes Writeable<T> all its properties and sub-properties.
   * https://stackoverflow.com/a/43001581/470818
   */
  export type DeepWriteable<T> = {
    -readonly [P in keyof T]: DeepWriteable<T[P]>;
  };
  export type Callback = (...args: Array<unknown>) => void;
  export type ErrorValueCallback<T = void> = (
    error: Maybe<Error>,
    value: Maybe<T>
  ) => void;
}
declare module 'preload/index' {
  import type { IpcRendererEvent } from 'electron';
  import type {
    Account,
    AccountWithPassword,
    Character,
  } from 'common/account/types';
  import type { Layout } from 'common/layout/types';
  import type { LogMessage } from 'common/logger/types';
  import type { Maybe } from 'common/types';
  /**
   * The index.d.ts file is auto-generated by the build process.
   */
  const appAPI: {
    ping: () => Promise<string>;
    /**
     * Logs a message to the main process.
     */
    log: (message: LogMessage) => Promise<void>;
    /**
     * Add or update credentials for a play.net account.
     */
    saveAccount: (account: AccountWithPassword) => Promise<void>;
    /**
     * Remove credentials for a play.net account.
     */
    removeAccount: (options: { accountName: string }) => Promise<void>;
    /**
     * List added accounts.
     */
    listAccounts: () => Promise<Array<Account>>;
    /**
     * Add or update a character for a given play.net account and game instance.
     */
    saveCharacter: (character: Character) => Promise<void>;
    /**
     * Remove a character for a given play.net account and game instance.
     */
    removeCharacter: (character: Character) => Promise<void>;
    /**
     * List added characters.
     */
    listCharacters: () => Promise<Array<Character>>;
    /**
     * Play the game with a given character.
     * This app can only play one character at a time.
     * Use the `onMessage` API to receive game data.
     * Use the `sendCommand` API to send game commands.
     */
    playCharacter: (character: Character) => Promise<void>;
    /**
     * Quit the game with the currently playing character, if any.
     * Similar to sending the `quit` command to the game but awaits
     * the game to confirm the quit before resolving.
     */
    quitCharacter: () => Promise<void>;
    /**
     * Gets a layout by name.
     */
    getLayout: (options: { layoutName: string }) => Promise<Maybe<Layout>>;
    /**
     * Lists all layout names.
     */
    listLayoutNames: () => Promise<Array<string>>;
    /**
     * Saves a layout by name.
     */
    saveLayout: (options: {
      layoutName: string;
      layout: Layout;
    }) => Promise<void>;
    /**
     * Deletes a layout by name.
     */
    deleteLayout: (options: { layoutName: string }) => Promise<void>;
    /**
     * Sends a command to the game as the currently playing character.
     * Use the `onMessage` API to receive game data.
     */
    sendCommand: (command: string) => Promise<void>;
    /**
     * Allows the renderer to subscribe to messages from the main process.
     * Returns an unsubscribe function, useful in react hook cleanup functions.
     */
    onMessage: (
      channel: string,
      callback: (event: IpcRendererEvent, ...args: Array<any>) => void
    ) => OnMessageUnsubscribe;
    /**
     * Allows the renderer to unsubscribe from messages from the main process.
     * Removes all listeners added by the `onMessage` API for a channel.
     */
    removeAllListeners(channel: string): void;
  };
  global {
    type OnMessageUnsubscribe = () => void;
    type TypeOfAppAPI = typeof appAPI;
    type AppAPI = {
      [K in keyof TypeOfAppAPI]: TypeOfAppAPI[K];
    };
    interface Window {
      api: AppAPI;
    }
  }
  export type { AppAPI };
}
declare module 'common/game/types' {
  /**
   * Simutronics has multiple games and instances per game.
   * Only interested in DragonRealms, though.
   */
  export enum GameCode {
    PRIME = 'DR',
    PLATINUM = 'DRX',
    FALLEN = 'DRF',
    TEST = 'DRT',
    DEVELOPMENT = 'DRD',
  }
  export interface GameCodeMeta {
    /**
     * The game code.
     * Example: 'DR' or 'DRX'.
     */
    code: GameCode;
    /**
     * The code name.
     * Example: 'Prime' or 'Platinum'.
     */
    name: string;
    /**
     * The game name.
     * Example: 'DragonRealms'.
     */
    game: string;
  }
  export const GameCodeMetaMap: Record<GameCode, GameCodeMeta>;
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
    directions: Array<string>;
  }
  /**
   * <progressBar id='mana' value='100'/>
   */
  export interface VitalsGameEvent extends GameEventBase {
    type: GameEventType.VITALS;
    vitalId: string;
    value: number;
  }
  /**
   * https://elanthipedia.play.net/Experience#Mindstates
   *
   * <component id='exp Attunement'>      Attunement:    1 46% attentive    </component>
   * <component id='exp Attunement'><preset id='whisper'>      Attunement:    1 46% attentive    </preset></component>
   */
  export interface ExperienceGameEvent extends GameEventBase {
    type: GameEventType.EXPERIENCE;
    skill: string;
    rank: number;
    percent: number;
    mindState: string;
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
    INVISIBLE = 'INVISIBLE',
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
    gameCode: GameCode;
  }
  export interface GameDisconnectMessage {
    accountName: string;
    characterName: string;
    gameCode: GameCode;
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
}
