import type { Mocked } from 'vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { StoreService } from '../../store/types.js';
import { PreferenceServiceImpl } from '../preference.service.js';

const { Store } = vi.hoisted(() => {
  const storeMock: Mocked<StoreService> = {
    keys: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockResolvedValue(undefined),
    set: vi.fn(),
    remove: vi.fn(),
    removeAll: vi.fn(),
  };

  return { Store: storeMock };
});

vi.mock('../../store/store.instance.ts', () => {
  return { Store };
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
