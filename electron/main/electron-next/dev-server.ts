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
import { logger } from './logger.js';

export const devServe = async (options: {
  /**
   * The directory to serve, relative to the app root directory.
   */
  directory: string;
  /**
   * The port to serve the renderer on.
   */
  port: number;
}): Promise<void> => {
  const { directory, port = 3000 } = options;

  logger.info('starting nextjs dev server', {
    directory,
    port,
  });

  // Dynamically import nextjs to avoid bundling it with the app
  // when webpack compiles and tree-shakes the project.
  const { default: nextjs } = await import('next');

  const createNextServer = nextjs as unknown as (
    options: NextServerOptions
  ) => NextServer;

  const nextServer = createNextServer({ dev: true, dir: directory });

  const requestHandler = nextServer.getRequestHandler();

  // Build the renderer code and watch the files.
  await nextServer.prepare();

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
    app.once('before-quit', () => {
      logger.info('stopping nextjs dev server');
      httpServer.close();
    });
  });
};
