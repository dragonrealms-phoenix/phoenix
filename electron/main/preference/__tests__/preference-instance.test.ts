import type { Mocked } from 'vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { StoreService } from '../../store/types.js';
import { PreferenceServiceImpl } from '../preference.service.js';

const { mockStore } = vi.hoisted(() => {
  const mockStore: Mocked<StoreService> = {
    keys: vi.fn<[], Promise<Array<string>>>(),
    get: vi.fn<[string], Promise<any>>(),
    set: vi.fn<[string, any], Promise<void>>(),
    remove: vi.fn<[string], Promise<void>>(),
    removeAll: vi.fn<[], Promise<void>>(),
  };

  return { mockStore };
});

vi.mock('../../store/store.instance.ts', () => {
  return { Store: mockStore };
});

describe('preference-instance', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  it('is a preference service', async () => {
    const Preferences = (await import('../preference.instance.js')).Preferences;
    expect(Preferences).toBeInstanceOf(PreferenceServiceImpl);
  });
});
