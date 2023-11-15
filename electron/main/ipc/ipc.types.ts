export interface IpcInvokeHandler<K extends keyof AppAPI> {
  (params: Parameters<AppAPI[K]>): ReturnType<AppAPI[K]>;
}

export type IpcHandlerRegistry = {
  [channel in keyof AppAPI]: IpcInvokeHandler<channel>;
};
