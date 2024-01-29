import type { Maybe } from '../../common/types.js';

export interface StoreService {
  keys(): Promise<Array<string>>;
  get<T>(key: string): Promise<Maybe<T>>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  removeAll(): Promise<void>;
}
