import * as tls from 'node:tls';
import { toUpperSnakeCase } from '../../common/string/to-upper-snake-case.js';
import { logger } from './logger.js';

/**
 * Connects via TLS to obtain the server's certificate.
 */
export const downloadCertificate = async (
  options: tls.ConnectionOptions
): Promise<tls.PeerCertificate> => {
  const { host, port } = options;

  logger.debug('downloading certificate', { host, port });

  return new Promise<tls.PeerCertificate>((resolve, reject): void => {
    const connectOptions: tls.ConnectionOptions = {
      // When downloading a self-signed cert then it won't be trusted yet
      // so we need to allow unauthorized requests for now.
      // Be sure to use the certificate in future requests, especially
      // when sending/receiving data with the server.
      rejectUnauthorized: false,
      ...options,
    };

    const socket = tls.connect(connectOptions, (): void => {
      logger.debug('socket connected', { host, port });
      resolveSocket(socket.getPeerCertificate());
    });

    socket.once('end', (): void => {
      logger.debug('socket connection ended', { host, port });
    });

    socket.once('close', (): void => {
      logger.debug('socket connection closed', { host, port });
    });

    socket.once('timeout', (): void => {
      const timeout = socket.timeout;
      logger.error('socket inactivity timeout', { host, port, timeout });
      rejectSocket(new Error(`[TLS:SOCKET:STATUS:TIMEOUT] ${timeout}`));
    });

    socket.once('error', (error: Error): void => {
      logger.error('socket error', { host, port, error });
      rejectSocket(
        new Error(
          `[TLS:SOCKET:ERROR:${toUpperSnakeCase(error.name)}] ${error.message}`
        )
      );
    });

    const resolveSocket = (result: tls.PeerCertificate): void => {
      logger.debug('downloaded certificate', {
        host,
        port,
        issuer: result.issuer,
        subject: result.subject,
        validFrom: result.valid_from,
        validTo: result.valid_to,
        serialNumber: result.serialNumber,
        fingerprint: result.fingerprint,
      });
      socket.destroy();
      resolve(result);
    };

    const rejectSocket = (error: Error): void => {
      socket.destroy();
      reject(error);
    };
  });
};
