/**
 * The index.d.ts file is auto-generated by the build process.
 */
declare const appAPI: {
  ping: () => Promise<string>;
  speak: (text: string) => Promise<void>;
  climb: (data: { height: number }) => Promise<number>;
};
declare global {
  type TypeOfAppAPI = typeof appAPI;
  type AppAPI = {
    [K in keyof TypeOfAppAPI]: TypeOfAppAPI[K];
  };
  interface Window {
    api: AppAPI;
  }
}
export type { AppAPI };
