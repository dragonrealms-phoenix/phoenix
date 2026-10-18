import type { Mocked } from 'vitest';
import { vi } from 'vitest';
import type { SettingService } from '../types.js';

export class SettingServiceMockImpl implements Mocked<SettingService> {
  constructorSpy = vi.fn();

  constructor(...args: Array<any>) {
    this.constructorSpy(args);
  }

  getClasses = vi.fn<SettingService['getClasses']>();

  upsertClass = vi.fn<SettingService['upsertClass']>();

  getHighlights = vi.fn<SettingService['getHighlights']>();

  getEnabledHighlights = vi.fn<SettingService['getEnabledHighlights']>();

  getIgnores = vi.fn<SettingService['getIgnores']>();

  getEnabledIgnores = vi.fn<SettingService['getEnabledIgnores']>();

  getSubstitutes = vi.fn<SettingService['getSubstitutes']>();

  getEnabledSubstitutes = vi.fn<SettingService['getEnabledSubstitutes']>();

  getTriggers = vi.fn<SettingService['getTriggers']>();

  getEnabledTriggers = vi.fn<SettingService['getEnabledTriggers']>();

  clear = vi.fn<SettingService['clear']>();

  load = vi.fn<SettingService['load']>();
}
