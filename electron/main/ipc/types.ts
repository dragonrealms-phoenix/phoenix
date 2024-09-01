import type {
  GameCommandMessage,
  GameConnectMessage,
  GameDisconnectMessage,
  GameErrorMessage,
  GameEventMessage,
} from '../../common/game/types.js';

/**
 * Defines the IPC API exposed to the renderer process.
 * The main process must provide call-response handlers for this API.
 * Excludes the `onMessage` push-style API from main to renderer.
 */
export type IpcInvokableEvent = keyof Omit<
  AppAPI,
  'onMessage' | 'removeAllListeners'
>;

export interface IpcInvokeHandler<K extends IpcInvokableEvent> {
  (params: Parameters<AppAPI[K]>): ReturnType<AppAPI[K]>;
}

export type IpcHandlerRegistry = {
  [channel in IpcInvokableEvent]: IpcInvokeHandler<channel>;
};

export type IpcSgeAccount = {
  accountName: string;
};

export type IpcSgeCharacter = {
  gameCode: string;
  accountName: string;
  characterName: string;
};

/**
 * Defines the channels and message types that can be dispatched
 * from the main process to the renderer process.
 */
export type IpcDispatcher = {
  (channel: 'pong', message: 'pong'): void;
  (channel: 'game:connect', message: GameConnectMessage): void;
  (channel: 'game:disconnect', message: GameDisconnectMessage): void;
  (channel: 'game:error', message: GameErrorMessage): void;
  (channel: 'game:event', message: GameEventMessage): void;
  (channel: 'game:command', message: GameCommandMessage): void;
};
