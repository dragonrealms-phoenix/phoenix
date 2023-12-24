import * as net from 'node:net';

export class NetSocketMock extends net.Socket {
  public connectSpy: jest.Mock;
  public writeSpy: jest.Mock;
  public pauseSpy: jest.Mock;
  public destroySoonSpy: jest.Mock;

  public readonly writable: boolean;
  public readonly timeout: number;

  private emitTimeout: boolean;
  private emitError: boolean;

  private dataListener?: (data?: unknown) => void;
  private connectListener?: () => void;
  private endListener?: () => void;
  private closeListener?: () => void;
  private timeoutListener?: () => void;
  private errorListener?: (error: Error) => void;

  constructor(options: {
    writable: boolean;
    timeout: number;
    emitTimeout?: boolean;
    emitError?: boolean;
  }) {
    super();
    this.writable = options.writable;
    this.timeout = options.timeout;
    this.emitTimeout = options.emitTimeout ?? false;
    this.emitError = options.emitError ?? false;
    this.connectSpy = jest.fn();
    this.writeSpy = jest.fn();
    this.pauseSpy = jest.fn();
    this.destroySoonSpy = jest.fn();
  }

  public connect(args: any): this {
    this.connectSpy(args);
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
        setTimeout(() => {
          if (!jest.isEnvironmentTornDown()) {
            this.connectListener?.();
          }
        }, 250).unref();
        setTimeout(() => {
          if (!jest.isEnvironmentTornDown()) {
            this.dataListener?.('<mode id="GAME"/>\n');
          }
        }, 500).unref();
        setTimeout(() => {
          if (!jest.isEnvironmentTornDown()) {
            this.dataListener?.('<data/>\n');
          }
        }, 2000).unref();
        break;
      case 'end':
        this.endListener = listener; // called when socket is destroyed
        break;
      case 'close':
        this.closeListener = listener; // called when socket is destroyed
        break;
      case 'timeout':
        this.timeoutListener = listener;
        if (this.emitTimeout) {
          setTimeout(() => {
            if (!jest.isEnvironmentTornDown()) {
              this.timeoutListener?.();
            }
          }, 1000).unref();
        }
        break;
      case 'error':
        this.errorListener = listener;
        if (this.emitError) {
          setTimeout(() => {
            if (!jest.isEnvironmentTornDown()) {
              this.errorListener?.(new Error('test'));
            }
          }, 1000).unref();
        }
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
