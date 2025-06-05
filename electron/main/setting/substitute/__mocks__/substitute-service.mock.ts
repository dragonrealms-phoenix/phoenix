import type { Mocked } from 'vitest';
import { vi } from 'vitest';
import type { SubstituteSettingService } from '../types.js';

export class SubstituteSettingServiceMockImpl
  implements Mocked<SubstituteSettingService>
{
  constructorSpy = vi.fn();

  constructor(...args: Array<any>) {
    this.constructorSpy(args);
  }

  add = vi.fn<SubstituteSettingService['add']>();
  get = vi.fn<SubstituteSettingService['get']>();
  clear = vi.fn<SubstituteSettingService['clear']>();
  load = vi.fn<SubstituteSettingService['load']>();
}
