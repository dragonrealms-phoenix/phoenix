import tls from 'node:tls';
import merge from 'lodash-es/merge.js';
import { createSelfSignedConnectOptions } from '../../tls/create-self-signed-connect-options.js';
import { logger } from '../logger.js';
import { getTrustedTlsCertificate } from './get-tls-certificate.js';

/**
 * Simutronics uses a self-signed certificate.
 * This method downloads that certificate then creates
 * a new socket connection trusting that certificate and
 * proactively validating the server's certificate.
 */
export const connect = async (
  connectOptions?: tls.ConnectionOptions
): Promise<tls.TLSSocket> => {
  const defaultOptions: tls.ConnectionOptions = {
    host: 'eaccess.play.net',
    port: 7910,
    timeout: 5000,
  };

  let mergedOptions = merge({}, defaultOptions, connectOptions);

  const { host, port } = mergedOptions;

  const certToTrust = await getTrustedTlsCertificate(mergedOptions);

  mergedOptions = merge(
    {},
    mergedOptions,
    createSelfSignedConnectOptions({
      certToTrust,
    })
  );

  logger.debug('connecting to login server', { host, port });
  const socket = tls.connect(mergedOptions, (): void => {
    logger.debug('connected to login server', { host, port });
  });

  socket.on('end', (): void => {
    logger.debug('connection to login server ended', { host, port });
  });

  socket.on('close', (): void => {
    logger.debug('connection to login server closed', { host, port });
  });

  socket.on('timeout', (): void => {
    const timeout = socket.timeout;
    logger.error('login server inactivity timeout', { host, port, timeout });
  });

  socket.on('error', (error: Error): void => {
    logger.error('login server error', { host, port, error });
  });

  return socket;
};
