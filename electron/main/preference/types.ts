import type { Maybe } from '../../common/types.js';

export enum PreferenceKey {
  /**
   * The app zoom factor (as a percentage).
   * Scales the entire app window, text, etc just like in a browser.
   * 0.5 = 50%
   * 1.0 = 100%
   * 1.5 = 150%
   */
  APP_ZOOM_FACTOR = 'app.zoomFactor',
  /**
   * Whether to confirm before closing the app.
   */
  APP_CONFIRM_CLOSE = 'app.confirmClose',
  /**
   * The maximum number of lines to display in each game window.
   */
  GAME_WINDOW_SCROLLBACK_BUFFER_SIZE = 'game.window.scrollbackBufferSize',
  /**
   * The character to display when the game sends a prompt.
   * Generally, this is the ">" character.
   * To disable, set to an empty string.
   */
  GAME_WINDOW_PROMPT = 'game.window.prompt',
  /**
   * When a user submits a command, this is the separator character
   * that will be used to split the command into multiple commands.
   *
   * For example, if the separator is ";" and the user submits
   * "go bank; go window" then the app will send to the game two
   * commands: "go bank" and "go window".
   *
   * Success of performing the sequential commands depends on factors like
   * roundtime incurred, game mechanics, and the account's type-ahead limits.
   */
  GAME_COMMAND_SEPARATOR = 'game.command.separator',
  /**
   * The minimum length of a command to save it in the command history.
   */
  GAME_COMMAND_HISTORY_MIN_LENGTH = 'game.command.historyMinLength',
  /**
   * Absolute path to a Ruby executable supported by Lich.
   * Windows Example: "C:\path\to\Ruby4Lich\bin\ruby.exe"
   * macOS Example: "/path/to/.rbenv/shims/ruby"
   */
  LICH_RUBY_PATH = 'lich.rubyPath',
  /**
   * Absolute path to the Lich executable.
   * Windows Example: "C:\path\to\lich\lich.rbw"
   * macOS Example: "/path/to/lich.rbw"
   */
  LICH_PATH = 'lich.path',
  /**
   * The host to connect to when starting Lich.
   * Example: "localhost"
   */
  LICH_HOST = 'lich.host',
  /**
   * The port to connect to when starting Lich.
   * Example: 11024
   */
  LICH_PORT = 'lich.port',
  /**
   * The number of seconds to wait after starting Lich before
   * attempting to connect to it.
   */
  LICH_START_WAIT = 'lich.startWait',
  /**
   * Should the app auto start and connect to Lich when playing a character?
   */
  LICH_ENABLED = 'lich.enabled',
}

export type PreferenceKeyToTypeMap = {
  [PreferenceKey.APP_ZOOM_FACTOR]: number;
  [PreferenceKey.APP_CONFIRM_CLOSE]: boolean;
  [PreferenceKey.GAME_WINDOW_SCROLLBACK_BUFFER_SIZE]: number;
  [PreferenceKey.GAME_WINDOW_PROMPT]: string;
  [PreferenceKey.GAME_COMMAND_SEPARATOR]: string;
  [PreferenceKey.GAME_COMMAND_HISTORY_MIN_LENGTH]: number;
  [PreferenceKey.LICH_RUBY_PATH]: string;
  [PreferenceKey.LICH_PATH]: string;
  [PreferenceKey.LICH_HOST]: string;
  [PreferenceKey.LICH_PORT]: number;
  [PreferenceKey.LICH_START_WAIT]: number;
  [PreferenceKey.LICH_ENABLED]: boolean;
};

export interface PreferenceService {
  get<K extends PreferenceKey, V extends PreferenceKeyToTypeMap[K]>(
    key: K,
    defaultValue: V
  ): V;

  get<K extends PreferenceKey, V extends PreferenceKeyToTypeMap[K]>(
    key: K
  ): Maybe<V>;

  set<K extends PreferenceKey, V extends PreferenceKeyToTypeMap[K]>(
    key: K,
    value: V
  ): void;

  remove(key: PreferenceKey): void;
}
