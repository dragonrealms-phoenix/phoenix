/**
 * This module enables hot-reloading with Nextjs during development.
 * The project `electron-next` was originally developed by Leo Lamprecht.
 * https://github.com/leo/electron-next
 *
 * That project went dormant in 2018.
 * As part of my effort to migrate to ESM, I've forked that module here.
 */

import { app } from 'electron';
import * as http from 'node:http';
import type { NextServer, NextServerOptions } from 'next/dist/server/next.js';
import { runInBackground } from '../../common/async/run-in-background.js';
import { sleep } from '../../common/async/sleep.js';

export const serve = async (options: {
  /**
   * Path to the renderer directory, the root of your nextjs web app.
   */
  rendererPath: string;
  /**
   * The port to serve the renderer on.
   */
  port: number;
}): Promise<void> => {
  const { rendererPath, port = 3000 } = options;

  // Dynamically import nextjs to avoid bundling it with the app
  // when webpack compiles and tree-shakes the project.
  const { default: nextjs } = await import('next');

  const createNextServer = nextjs as unknown as (
    options: NextServerOptions
  ) => NextServer;

  const nextServer = createNextServer({ dev: true, dir: rendererPath });

  const requestHandler = nextServer.getRequestHandler();

  // Build the renderer code and watch the files.
  await nextServer.prepare();

  console.log('nextjs server is ready');
  await sleep(30_000);

  // Create a new native HTTP server to support hot code reloading.
  const httpServer = http.createServer(
    (req: http.IncomingMessage, res: http.ServerResponse) => {
      runInBackground(async () => {
        await requestHandler(req, res);
      });
    }
  );

  httpServer.listen(port, () => {
    // Make sure to stop the server when the app closes.
    // Otherwise it keeps running on its own.
    app.on('before-quit', () => httpServer.close());
  });
};
