import type { IpcDispatcher, IpcInvokeHandler } from '../types.js';

export const pingHandler = (options: {
  dispatch: IpcDispatcher;
}): IpcInvokeHandler<'ping'> => {
  const { dispatch } = options;

  return async (_args): Promise<string> => {
    dispatch('pong', 'pong');
    return 'pong';
  };
};
