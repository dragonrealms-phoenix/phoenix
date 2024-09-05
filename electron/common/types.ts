/**
 * Either a value or undefined.
 * https://non-traditional.dev/the-power-of-maybe-in-typescript
 */
export type Maybe<T> = NonNullable<T> | undefined;

export const convertToMaybe = <T>(value: T): Maybe<T> => {
  return value ?? undefined;
};

/**
 * Same as Partial<T> but goes deeper and makes Partial<T> all its properties and sub-properties.
 * https://github.com/typeorm/typeorm/blob/8ba742eb36586a21a918ed178208874a53ace3f9/src/common/DeepPartial.ts
 */
export type DeepPartial<T> =
  | T
  | (T extends Array<infer U>
      ? Array<DeepPartial<U>>
      : T extends Map<infer K, infer V>
        ? Map<DeepPartial<K>, DeepPartial<V>>
        : T extends Set<infer M>
          ? Set<DeepPartial<M>>
          : T extends object
            ? { [K in keyof T]?: DeepPartial<T[K]> }
            : T);

/**
 * Opposite of Readonly<T>.
 * https://stackoverflow.com/a/43001581/470818
 */
export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

/**
 * Same as Writeable<T> but goes deeper and makes Writeable<T> all its properties and sub-properties.
 * https://stackoverflow.com/a/43001581/470818
 */
export type DeepWriteable<T> = {
  -readonly [P in keyof T]: DeepWriteable<T[P]>;
};
