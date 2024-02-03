import * as net from 'node:net';
import type { Mock } from 'vitest';
import { vi } from 'vitest';

export class NetSocketMock extends net.Socket {
  public connectSpy: Mock;
  public writeSpy: Mock;
  public pauseSpy: Mock;
  public destroySoonSpy: Mock;

  public writable: boolean;
  public timeout: number;

  private dataListener?: (data?: unknown) => void;
  private connectListener?: () => void;
  private endListener?: () => void;
  private closeListener?: () => void;
  private timeoutListener?: () => void;
  private errorListener?: (error: Error) => void;

  constructor(options: { timeout: number }) {
    super();
    this.writable = false;
    this.timeout = options.timeout;
    this.connectSpy = vi.fn();
    this.writeSpy = vi.fn();
    this.pauseSpy = vi.fn();
    this.destroySoonSpy = vi.fn();
  }

  // -- Mock Test Functions -- //

  public emitData(data: unknown): void {
    this.dataListener?.(data);
  }

  public emitTimeoutEvent(): void {
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
    this.writable = false;
    this.endListener?.();
    this.closeListener?.();
  }

  on(event: string, listener: (...args: Array<any>) => void): this {
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

  once(event: string, listener: (...args: Array<any>) => void): this {
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
