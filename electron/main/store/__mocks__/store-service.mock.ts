import type { Mocked } from 'vitest';
import { vi } from 'vitest';
import type { Maybe } from '../../../common/types.js';
import type { StoreService } from '../types.js';

export class StoreServiceMockImpl implements Mocked<StoreService> {
  constructorSpy = vi.fn();

  constructor(...args: Array<any>) {
    this.constructorSpy(args);
  }

  keys = vi.fn<StoreService['keys']>();
  get = vi.fn<(key: string) => Promise<Maybe<any>>>();
  set = vi.fn<StoreService['set']>();
  remove = vi.fn<StoreService['remove']>();
  removeAll = vi.fn<StoreService['removeAll']>();
}
