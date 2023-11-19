export type StoredValue<T> =
  | {
      encrypted: true;
      value: string; // hex string of encrypted json-stringified value
    }
  | {
      encrypted: false;
      value: T;
    };

export interface StoreSetOptions {
  /**
   * If `encrypted` is true then uses the operating system's
   * secure storage to encrypt and protect the value before storing it.
   */
  encrypted?: boolean;
}

export interface StoreService {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, options?: StoreSetOptions): Promise<void>;
  remove(key: string): Promise<void>;
}
