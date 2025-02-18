import { afterEach, describe, expect, it, vi } from 'vitest';
import { PreferenceServiceImpl } from '../preference.service.js';

const { mockStoreService, mockGetStoreForPath } = await vi.hoisted(async () => {
  const storeServiceMockModule = await import(
    '../../store/__mocks__/store-service.mock.js'
  );

  const mockStoreService = new storeServiceMockModule.StoreServiceMockImpl();

  const mockGetStoreForPath = vi.fn();

  return { mockStoreService, mockGetStoreForPath };
});

vi.mock('../../store/store.instance.ts', () => {
  return {
    getStoreForPath: mockGetStoreForPath.mockReturnValue(mockStoreService),
  };
});

vi.mock('electron', async () => {
  return {
    app: {
      getPath: vi.fn().mockImplementation(() => 'userData'),
    },
  };
});

vi.mock('../../logger/logger.factory.ts');

describe('preference-instance', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  it('is a preference service', async () => {
    const { Preferences } = await import('../preference.instance.js');

    expect(Preferences).toBeInstanceOf(PreferenceServiceImpl);

    expect(mockGetStoreForPath).toHaveBeenCalledWith(
      'userData/preferences.json'
    );
  });
});
