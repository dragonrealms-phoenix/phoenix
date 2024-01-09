import { StoreServiceMock } from '../../store/__mocks__/store-service.mock';
import { PreferenceServiceImpl } from '../preference.service';
import type { PreferenceKey, PreferenceService } from '../preference.types';

describe('preference-service', () => {
  let storeService: StoreServiceMock;
  let preferenceService: PreferenceService;

  beforeEach(() => {
    storeService = new StoreServiceMock();

    storeService.get.mockImplementation(async (key: string) => {
      if (key === 'key') {
        return 'value';
      }
      return undefined;
    });

    preferenceService = new PreferenceServiceImpl({
      storeService,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('#get', () => {
    it('should return value if key found', async () => {
      const value = await preferenceService.get('key' as PreferenceKey);
      expect(value).toEqual('value');
      expect(storeService.get).toHaveBeenCalledWith('key');
    });

    it('should return undefined if key not found', async () => {
      const value = await preferenceService.get('test' as PreferenceKey);
      expect(value).toBeUndefined();
      expect(storeService.get).toHaveBeenCalledWith('test');
    });
  });

  describe('#set', () => {
    it('should set value', async () => {
      await preferenceService.set('key' as PreferenceKey, 'value');
      expect(storeService.set).toHaveBeenCalledWith('key', 'value');
    });
  });

  describe('#remove', () => {
    it('should remove value', async () => {
      await preferenceService.remove('key' as PreferenceKey);
      expect(storeService.remove).toHaveBeenCalledWith('key');
    });
  });
});
