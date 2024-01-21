/**
 * Either a value or undefined.
 * https://non-traditional.dev/the-power-of-maybe-in-typescript
 */
export type Maybe<T> = NonNullable<T> | undefined;

export function convertToMaybe<T>(value: T): Maybe<T> {
  return value ?? undefined;
}
