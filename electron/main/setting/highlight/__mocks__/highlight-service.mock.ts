import type { Mocked } from 'vitest';
import { vi } from 'vitest';
import type { HighlightSettingService } from '../types.js';

export class HighlightSettingServiceMockImpl
  implements Mocked<HighlightSettingService>
{
  constructorSpy = vi.fn();

  constructor(...args: Array<any>) {
    this.constructorSpy(args);
  }

  add = vi.fn<HighlightSettingService['add']>();
  get = vi.fn<HighlightSettingService['get']>();
  clear = vi.fn<HighlightSettingService['clear']>();
  load = vi.fn<HighlightSettingService['load']>();
}
