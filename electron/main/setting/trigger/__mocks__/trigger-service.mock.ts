import type { Mocked } from 'vitest';
import { vi } from 'vitest';
import type { TriggerSettingService } from '../types.js';

export class TriggerSettingServiceMockImpl
  implements Mocked<TriggerSettingService>
{
  constructorSpy = vi.fn();

  constructor(...args: Array<any>) {
    this.constructorSpy(args);
  }

  get = vi.fn<TriggerSettingService['get']>();
  clear = vi.fn<TriggerSettingService['clear']>();
  load = vi.fn<TriggerSettingService['load']>();
}
