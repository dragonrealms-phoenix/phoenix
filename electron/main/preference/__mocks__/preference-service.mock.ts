import type { PreferenceService } from '../preference.types';

class PreferenceServiceMock implements PreferenceService {
  get = jest.fn();
  set = jest.fn();
  remove = jest.fn();
}

export { PreferenceServiceMock };
