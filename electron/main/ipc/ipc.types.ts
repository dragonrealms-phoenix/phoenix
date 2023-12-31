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

export type IpcSgeCharacter = {
  gameCode: string;
  accountName: string;
  characterName: string;
};
