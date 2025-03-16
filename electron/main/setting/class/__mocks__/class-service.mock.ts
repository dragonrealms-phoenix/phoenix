import type { Mocked } from 'vitest';
import { vi } from 'vitest';
import type { ClassSettingService } from '../types.js';

export class ClassSettingServiceMockImpl
  implements Mocked<ClassSettingService>
{
  constructorSpy = vi.fn();

  constructor(...args: Array<any>) {
    this.constructorSpy(args);
  }

  get = vi.fn<ClassSettingService['get']>();
  clear = vi.fn<ClassSettingService['clear']>();
  load = vi.fn<ClassSettingService['load']>();
}
