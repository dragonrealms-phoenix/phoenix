import type { Mocked } from 'vitest';
import { vi } from 'vitest';
import type { Maybe } from '../../../common/types.js';
import type { PreferenceKey, PreferenceService } from '../types.js';

export class PreferenceServiceMockImpl implements Mocked<PreferenceService> {
  constructorSpy = vi.fn();

  constructor(...args: Array<any>) {
    this.constructorSpy(args);
  }

  get = vi.fn<(key: PreferenceKey) => Maybe<any>>();
  set = vi.fn<PreferenceService['set']>();
  remove = vi.fn<PreferenceService['remove']>();
}
