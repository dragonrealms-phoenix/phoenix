import type { Maybe } from '../../common/types.js';

export function hasLocalStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

export const LocalStorage = {
  /**
   * Gets a JSON value from local storage for the given key.
   * If either local storage isn't defined or key not found then
   * returns undefined.
   */
  get: <T>(key: string): Maybe<T> => {
    if (!hasLocalStorage()) {
      return;
    }
    const value = localStorage.getItem(key);
    if (value) {
      return JSON.parse(value);
    }
    return;
  },
  /**
   * Sets a JSON value in local storage for the given key.
   * The value should be JSON serializable.
   * For example, not a `Map` or `Set` because those become `{}`.
   */
  set: <T>(key: string, value: T): void => {
    if (!hasLocalStorage()) {
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  },
};
