import { Writable } from 'node:stream';
import { vi } from 'vitest';

type Callback = (...args: Array<unknown>) => void;

export class WritableMock extends Writable {
  private onCallbacksMap: Record<string, Array<Callback>> = {};
  private onceCallbacksMap: Record<string, Array<Callback>> = {};

  public writable: boolean = true;

  write = vi.fn((_chunk: any, _encoding?: any, callback?: any): boolean => {
    if (callback) {
      callback(null);
    }
    return true;
  });

  on = vi.fn((event: string, cb: Callback): this => {
    this.onCallbacksMap[event] ||= [];
    this.onCallbacksMap[event].push(cb);
    return this;
  });

  once = vi.fn((event: string, cb: Callback): this => {
    this.onceCallbacksMap[event] ||= [];
    this.onceCallbacksMap[event].push(cb);
    return this;
  });

  off = vi.fn((event: string, cb: Callback): this => {
    const onCallbacks = this.onCallbacksMap[event];
    if (onCallbacks) {
      this.onCallbacksMap[event] = onCallbacks.filter(
        (callback) => callback !== cb
      );
    }

    const onceCallbacks = this.onceCallbacksMap[event];
    if (onceCallbacks) {
      this.onceCallbacksMap[event] = onceCallbacks.filter(
        (callback) => callback !== cb
      );
    }

    return this;
  });

  emit = vi.fn((event: string, ...args: Array<unknown>): boolean => {
    const onCallbacks = this.onCallbacksMap[event];
    if (onCallbacks) {
      onCallbacks.forEach((cb) => cb(...args));
    }

    const onceCallbacks = this.onceCallbacksMap[event];
    if (onceCallbacks) {
      onceCallbacks.forEach((cb) => cb(...args));
      delete this.onceCallbacksMap[event];
    }

    const hasCallbacks = onCallbacks?.length > 0 || onceCallbacks?.length > 0;

    return hasCallbacks;
  });
}
