import type { Mocked } from 'vitest';
import { vi } from 'vitest';
import type { LayoutService } from '../types.js';

export class LayoutServiceMockImpl implements Mocked<LayoutService> {
  constructorSpy = vi.fn();

  constructor(...args: Array<any>) {
    this.constructorSpy(args);
  }

  getLayout = vi.fn<LayoutService['getLayout']>();
  listLayoutNames = vi.fn<LayoutService['listLayoutNames']>();
  saveLayout = vi.fn<LayoutService['saveLayout']>();
  deleteLayout = vi.fn<LayoutService['deleteLayout']>();
}
