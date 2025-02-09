import type { Mocked } from 'vitest';
import { vi } from 'vitest';
import type { LayoutService } from '../types.js';

export class LayoutServiceMockImpl implements Mocked<LayoutService> {
  constructorSpy = vi.fn();

  constructor(...args: Array<any>) {
    this.constructorSpy(args);
  }

  get = vi.fn<LayoutService['get']>();
  list = vi.fn<LayoutService['list']>();
  save = vi.fn<LayoutService['save']>();
  delete = vi.fn<LayoutService['delete']>();
}
