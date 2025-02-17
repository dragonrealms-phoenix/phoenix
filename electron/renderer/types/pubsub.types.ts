import type { ReactNode } from 'react';
import type * as AccountTypes from '../../common/account/types.js';
import type * as GameTypes from '../../common/game/types.js';
import type * as SidebarTypes from './sidebar.types.js';

export namespace PubSubData {
  export type GameConnect = GameTypes.GameConnectMessage;

  export type GameDisconnect = GameTypes.GameDisconnectMessage;

  export type GameEvent = GameTypes.GameEvent;

  /**
   * Game command to perform.
   */
  export type GameCommand = string;

  /**
   * Error thrown while interacting with the game.
   * For example, errors with auth, socket, parse, etc.
   */
  export type GameError = Error;

  /**
   * The sidebar id to show.
   */
  export type SidebarShow = SidebarTypes.SidebarId;

  export type ToastAdd = {
    title: string;
    text?: ReactNode;
    type?: 'success' | 'warning' | 'danger' | 'info';
  };

  export type CharacterPlayStarting = AccountTypes.Character;

  export type CharacterPlayStarted = AccountTypes.Character;

  export type CharacterPlayStopping = AccountTypes.Character;

  export type CharacterPlayStopped = AccountTypes.Character;

  /**
   * Layout name to load.
   */
  export type LayoutLoad = string;

  /**
   * Layout item id that was closed.
   */
  export type LayoutItemClosed = string;

  export type LayoutItemMoved = {
    itemId: string;
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
