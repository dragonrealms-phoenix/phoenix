import type { ReactNode } from 'react';
import type * as AccountTypes from '../../common/account/types.js';
import type * as GameTypes from '../../common/game/types.js';
import type * as SidebarTypes from './sidebar.types.js';

/**
 * By convention, I try to name the event types after their topics.
 */
export namespace PubSubEvent {
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

  export type LayoutLoad = {
    layoutName: string;
  };

  export type LayoutItemClosed = {
    itemId: string;
  };

  export type LayoutItemMoved = {
    itemId: string;
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
