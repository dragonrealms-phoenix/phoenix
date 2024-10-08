import type { Maybe } from '../../common/types.js';

export enum PreferenceKey {
  /**
   * The window zoom factor (as a percentage).
   * 0.5 = 50%
   * 1.0 = 100%
   * 1.5 = 150%
   */
  WINDOW_ZOOM_FACTOR = 'preference.window.zoomFactor',
  /**
   * Whether to confirm before closing the window.
   */
  WINDOW_CONFIRM_ON_CLOSE = 'preference.window.confirmOnClose',
  /**
   * How the mind state is shown in the game experience stream.
   * When 'numbers' then the mind state is shown as a fraction (e.g. 7/34).
   * When 'words' then the mind state is shown as a word (e.g. 'pondering').
   */
  GAME_STREAM_EXPERIENCE_SHOW_MIND_STATE_AS = 'preference.gameStream.experience.showMindStateAs',
  /**
   * The maximum number of lines to keep in any game stream.
   */
  GAME_STREAM_SCROLLBACK_BUFFER_SIZE = 'preference.gameStream.scrollbackBufferSize',
  /**
   * Map of grid item ids or other identifiers to custom text styles.
   *
   * Example keys include grid item ids like 'main', 'combat', etc.
   *
   * They also include the special keys '__ROOM_NAME__' and '__BOLD__',
   * which are used to style the room name and bold text respectively.
   *
   * They also include the special key '__DEFAULT__', which is used
   * when no grid item-specific text style is defined.
   */
  GAME_STREAM_TEXT_STYLES = 'preference.gameStream.textStyles',
  /**
   * Map of character names to grid layouts.
   *
   * Key format: `${accountName}:${characterName}:${gameCode}`.
   * Example: `MyAccount:Katoak:DR`.
   *
   * They also include the special key '__DEFAULT__', which is used
   * when no character-specific grid layout is defined.
   */
  GAME_STREAM_GRID_LAYOUTS = 'preference.gameStream.gridLayouts',
}

export type PreferenceKeyToTypeMap = {
  [PreferenceKey.WINDOW_ZOOM_FACTOR]: number;

  [PreferenceKey.WINDOW_CONFIRM_ON_CLOSE]: boolean;

  [PreferenceKey.GAME_STREAM_EXPERIENCE_SHOW_MIND_STATE_AS]:
    | 'numbers'
    | 'words';

  [PreferenceKey.GAME_STREAM_SCROLLBACK_BUFFER_SIZE]: number;

  [PreferenceKey.GAME_STREAM_TEXT_STYLES]: {
    [key: string]: {
      fontFamilySerif?: string;
      fontFamilyMono?: string;
      fontSize?: number;
      color?: string;
      backgroundColor?: string;
    };
  };

  [PreferenceKey.GAME_STREAM_GRID_LAYOUTS]: {
    /**
     * Who the grid layout belongs to.
     * Example: `${accountName}:${characterName}:${gameCode}`
     */
    [key: string]: {
      /**
       * The items on the grid and how they are laid out.
       */
      gridItems: Array<{
        // TODO add more properties like position, size, etc.
        id: string;
        title: string;
      }>;
    };
  };
};

export interface PreferenceService {
  get<K extends PreferenceKey>(
    key: K
  ): Promise<Maybe<PreferenceKeyToTypeMap[K]>>;

  set<K extends PreferenceKey, V = PreferenceKeyToTypeMap[K]>(
    key: K,
    value: V
  ): Promise<void>;

  remove(key: PreferenceKey): Promise<void>;
}
