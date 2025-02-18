import type { Maybe } from '../../common/types.js';

export enum PreferenceKey {
  /**
   * The window zoom factor (as a percentage).
   * 0.5 = 50%
   * 1.0 = 100%
   * 1.5 = 150%
   */
  WINDOW_ZOOM_FACTOR = 'window.zoomFactor',
  /**
   * Whether to confirm before closing the window.
   */
  WINDOW_CONFIRM_ON_CLOSE = 'window.confirmOnClose',
  /**
   * The maximum number of lines to keep in any game stream.
   */
  GAME_STREAM_SCROLLBACK_BUFFER_SIZE = 'gameStream.scrollbackBufferSize',
}

export type PreferenceKeyToTypeMap = {
  [PreferenceKey.WINDOW_ZOOM_FACTOR]: number;
  [PreferenceKey.WINDOW_CONFIRM_ON_CLOSE]: boolean;
  [PreferenceKey.GAME_STREAM_SCROLLBACK_BUFFER_SIZE]: number;
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
