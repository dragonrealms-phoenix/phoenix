import type { Mocked } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { StoreService } from '../../store/types.js';
import type { PreferenceService } from '../types.js';
import { PreferenceKey } from '../types.js';

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
  let Preferences: PreferenceService;

  beforeEach(async () => {
    Preferences = (await import('../preference.instance.js')).Preferences;
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  it('gets undefined when preference not set', async () => {
    const preference = await Preferences.get(PreferenceKey.WINDOW_ZOOM_FACTOR);

    expect(preference).toBe(undefined);
    expect(Store.get).toHaveBeenCalledWith(PreferenceKey.WINDOW_ZOOM_FACTOR);
  });

  it('gets a value when preference is set', async () => {
    Store.get.mockResolvedValue(1.5);

    const preference = await Preferences.get(PreferenceKey.WINDOW_ZOOM_FACTOR);

    expect(preference).toBe(1.5);
    expect(Store.get).toHaveBeenCalledWith(PreferenceKey.WINDOW_ZOOM_FACTOR);
  });

  it('sets a preference', async () => {
    await Preferences.set(PreferenceKey.WINDOW_ZOOM_FACTOR, 1.5);

    expect(Store.set).toHaveBeenCalledWith(
      PreferenceKey.WINDOW_ZOOM_FACTOR,
      1.5
    );
  });

  it('removes a preference', async () => {
    await Preferences.remove(PreferenceKey.WINDOW_ZOOM_FACTOR);

    expect(Store.remove).toHaveBeenCalledWith(PreferenceKey.WINDOW_ZOOM_FACTOR);
  });
});
