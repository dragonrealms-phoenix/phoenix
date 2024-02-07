import type * as net from 'node:net';
import type { Mock } from 'vitest';
import { vi } from 'vitest';

/**
 * For mocking the `net.connect()` static method.
 * Retuns a function that when called creates a new `NetSocketMock` instance.
 */
export const mockNetConnect = (
  connectOptions: net.TcpNetConnectOpts,
  connectionListener?: () => void
): NetSocketMock & net.Socket => {
  const mockSocket = new NetSocketMock();

  mockSocket.connect(connectOptions);

  setImmediate(() => {
    connectionListener?.();
  });

  return mockSocket as NetSocketMock & net.Socket;
};

export class NetSocketMock {
  public connectSpy: Mock;
  public writeSpy: Mock;
  public pauseSpy: Mock;
  public destroySoonSpy: Mock;
  public destroySpy: Mock;

  public writable: boolean;
  public timeout?: number;

  private dataListener?: (data?: unknown) => void;
  private connectListener?: () => void;
  private endListener?: () => void;
  private closeListener?: () => void;
  private timeoutListener?: () => void;
  private errorListener?: (error: Error) => void;

  constructor() {
    this.writable = false;
    this.timeout = undefined;
    this.connectSpy = vi.fn();
    this.writeSpy = vi.fn();
    this.pauseSpy = vi.fn();
    this.destroySoonSpy = vi.fn();
    this.destroySpy = vi.fn();
  }

  // -- Mock Test Functions -- //

  public emitData(data: unknown): void {
    this.dataListener?.(data);
  }

  public emitTimeoutEvent(timeout?: number): void {
    this.timeout = timeout;
    this.timeoutListener?.();
  }

  public emitErrorEvent(error?: Error): void {
    this.errorListener?.(error ?? new Error('test'));
  }

  // -- Node.js Socket Functions -- //

  public connect(args: any): this {
    this.connectSpy(args);
    this.writable = true;
    return this;
  }

  public write(args: any): boolean {
    this.writeSpy(args);
    return true;
  }

  public pause(): this {
    this.pauseSpy();
    return this;
  }

  public destroySoon(): void {
    this.destroySoonSpy();
    this.destroy();
  }

  public destroy(): void {
    this.destroySpy();
    this.writable = false;
    this.endListener?.();
    this.closeListener?.();
  }

  public on(event: string, listener: (...args: Array<any>) => void): this {
    switch (event) {
      case 'data':
        this.dataListener = listener;
        break;
      case 'connect':
        this.connectListener = listener;
        this.connectListener?.();
        break;
      case 'end':
        this.endListener = listener; // called when socket is destroyed
        break;
      case 'close':
        this.closeListener = listener; // called when socket is destroyed
        break;
      case 'timeout':
        this.timeoutListener = listener;
        break;
      case 'error':
        this.errorListener = listener;
        break;
    }
    return this;
  }

  public once(event: string, listener: (...args: Array<any>) => void): this {
    this.on(event, (...args) => {
      listener(...args);
      this.removeListener(event);
    });
    return this;
  }

  public removeListener(event: string): this {
    switch (event) {
      case 'data':
        this.dataListener = undefined;
        break;
      case 'connect':
        this.connectListener = undefined;
        break;
      case 'end':
        this.endListener = undefined;
        break;
      case 'close':
        this.closeListener = undefined;
        break;
      case 'timeout':
        this.timeoutListener = undefined;
        break;
      case 'error':
        this.errorListener = undefined;
        break;
    }
    return this;
  }
}
