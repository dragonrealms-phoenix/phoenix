// Source: https://github.com/leo/electron-next
// Typings: https://github.com/vercel/next.js/blob/canary/examples/with-electron-typescript/electron-src/electron-next.d.ts

declare module 'electron-next' {
  interface Directories {
    production: string;
    development: string;
  }

  export default function (
    /**
     * Path to your nextjs app directory.
     * Can provide a string or an object with
     * separate paths for production and development.
     */
    directories: Directories | string,
    /**
     * Port to serve the nextjs app from.
     * Default 8000.
     */
    port?: number
  ): Promise<void>;
}
