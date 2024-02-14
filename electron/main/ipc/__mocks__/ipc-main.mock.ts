import type { IpcMainInvokeEvent } from 'electron/main';
import type { Mock } from 'vitest';
import { vi } from 'vitest';

type IpcChannelListener = (
  event: IpcMainInvokeEvent,
  ...args: Array<any>
) => Promise<any>;

export class IpcMainMock {
  public subscribeToChannelSpy: Mock;
  public unsubscribeFromChannelSpy: Mock;

  private channelListenersMap: Record<string, IpcChannelListener>;

  constructor() {
    this.channelListenersMap = {};
    this.subscribeToChannelSpy = vi.fn();
    this.unsubscribeFromChannelSpy = vi.fn();
  }

  // -- Mock Test Functions -- //

  public invokeChannel(channel: string, ...args: Array<any>): Promise<any> {
    const mockInvokeEvent = {} as IpcMainInvokeEvent;
    const listener = this.channelListenersMap[channel];
    return listener?.(mockInvokeEvent, ...args);
  }

  // -- Electron IPC Functions -- //

  public handle(channel: string, listener: IpcChannelListener): void {
    this.subscribeToChannelSpy(channel, listener);
    this.channelListenersMap[channel] = listener;
  }

  public removeHandler(channel: string): void {
    this.unsubscribeFromChannelSpy(channel);
    delete this.channelListenersMap[channel];
  }
}
