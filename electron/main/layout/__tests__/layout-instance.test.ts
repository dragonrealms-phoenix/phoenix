import { afterEach, describe, expect, it, vi } from 'vitest';
import { StoreServiceMockImpl } from '../../store/__mocks__/store-service.mock.js';
import { LayoutServiceImpl } from '../layout.service.js';

vi.mock('../../store/store.instance.ts', () => {
  return { Store: new StoreServiceMockImpl() };
});

vi.mock('../../logger/logger.factory.ts');

describe('layout-instance', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  it('is a layout service', async () => {
    const Layouts = (await import('../layout.instance.js')).Layouts;
    expect(Layouts).toBeInstanceOf(LayoutServiceImpl);
  });
});
