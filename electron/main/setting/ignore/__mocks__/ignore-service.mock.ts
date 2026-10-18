import type { Mocked } from 'vitest';
import { vi } from 'vitest';
import type { IgnoreSettingService } from '../types.js';

export class IgnoreSettingServiceMockImpl
  implements Mocked<IgnoreSettingService>
{
  constructorSpy = vi.fn();

  constructor(...args: Array<any>) {
    this.constructorSpy(args);
  }

  add = vi.fn<IgnoreSettingService['add']>();
  get = vi.fn<IgnoreSettingService['get']>();
  clear = vi.fn<IgnoreSettingService['clear']>();
  load = vi.fn<IgnoreSettingService['load']>();
}
