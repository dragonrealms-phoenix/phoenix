import { afterEach, describe, expect, it, vi } from 'vitest';
import { StoreServiceMockImpl } from '../../store/__mocks__/store-service.mock.js';
import { PreferenceServiceImpl } from '../preference.service.js';

vi.mock('../../store/store.instance.ts', () => {
  return { Store: new StoreServiceMockImpl() };
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
