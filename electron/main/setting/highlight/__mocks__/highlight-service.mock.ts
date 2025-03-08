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

  get = vi.fn<HighlightSettingService['get']>();
  load = vi.fn<HighlightSettingService['load']>();
  clear = vi.fn<HighlightSettingService['clear']>();
}
