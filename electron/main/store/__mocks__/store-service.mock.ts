import type { StoreService } from '../store.types';

export class StoreServiceMock implements StoreService {
  keys = jest.fn();
  get = jest.fn();
  set = jest.fn();
  remove = jest.fn();
  removeAll = jest.fn();
}
