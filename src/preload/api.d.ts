export declare const appAPI: {
  ping: () => Promise<string>;
};
declare global {
  type AppAPI = typeof appAPI;
}
