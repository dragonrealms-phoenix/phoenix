import crypto from 'node:crypto';
import tls from 'node:tls';
import { toUpperSnakeCase } from '../../common/string';
import type { Maybe } from '../../common/types';
import { createLogger } from '../logger';
import type { SelfSignedCertConnectOptions } from './tls.types';

const logger = createLogger('tls:utils');

/**
 * Sends a command then returns the next response received.
 * Useful when performing a call-response protocol handshake.
 *
 * Note, for the SGE login protocol, we must send and receive binary data
 * to avoid encoding issues with conversions of bytes => strings => bytes.
 */
export async function sendAndReceive(options: {
  socket: tls.TLSSocket;
  payload: Buffer;
  /**
   * The number of milliseconds to wait for a response before timing out.
   * Default is the socket's timeout value.
   */
  requestTimeout?: number;
}): Promise<Buffer> {
  const { socket, payload, requestTimeout = socket.timeout } = options;

  return new Promise<Buffer>((resolve, reject): void => {
    let requestTimeoutId: Maybe<NodeJS.Timeout>;

    const dataListener = (response: Buffer): void => {
      resolveSocket(response);
    };

    const closedListener = (): void => {
      rejectSocket(new Error(`[TLS:SOCKET:STATUS:CLOSED]`));
    };

    const timeoutListener = (): void => {
      const timeout = socket.timeout;
      rejectSocket(new Error(`[TLS:SOCKET:STATUS:TIMEOUT] ${timeout}`));
    };

    const errorListener = (error: Error): void => {
      rejectSocket(
        new Error(
          `[TLS:SOCKET:ERROR:${toUpperSnakeCase(error.name)}] ${error.message}`
        )
      );
    };

    const addListeners = (): void => {
      socket.once('data', dataListener);
      socket.once('end', closedListener);
      socket.once('close', closedListener);
      socket.once('timeout', timeoutListener);
      socket.once('error', errorListener);
    };

    const removeListeners = (): void => {
      socket.off('data', dataListener);
      socket.off('end', closedListener);
      socket.off('close', closedListener);
      socket.off('timeout', timeoutListener);
      socket.off('error', errorListener);
    };

    const resolveSocket = (response: Buffer): void => {
      clearTimeout(requestTimeoutId);
      removeListeners();
      resolve(response);
    };

    const rejectSocket = (error: Error): void => {
      clearTimeout(requestTimeoutId);
      removeListeners();
      reject(error);
    };

    addListeners();

    if (requestTimeout) {
      requestTimeoutId = setTimeout(() => {
        rejectSocket(
          new Error(`[TLS:SOCKET:REQUEST:TIMEOUT] ${requestTimeout}`)
        );
      }, requestTimeout);
    }

    socket.write(payload);
  });
}

/**
 * Connects via TLS to obtain the server's certificate.
 */
export async function downloadCertificate(
  options: tls.ConnectionOptions
): Promise<tls.PeerCertificate> {
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
}

/**
 * Returns a subset of connection options to validate that a server's
 * self-signed certificate matches a PEM-encoded certificate you trust.
 *
 * Since it is self-signed, we cannot rely on core nodejs checks because
 * it flags those as insecure. And we don't want to disable all TLS checks
 * using `rejectUnauthorized: false` because that is foolish.
 */
export function createSelfSignedCertConnectOptions(options: {
  certToTrust: string | tls.PeerCertificate;
}): SelfSignedCertConnectOptions {
  const { certToTrust } = options;

  const pemToTrust = getPEM(certToTrust);

  return {
    ca: [pemToTrust],
    // Have the server send us their certificate so we can verify it.
    requestCert: true,
    // Verify the server's certificate matches the one we trust.
    // Otherwise the connection is insecure, do not proceed.
    checkServerIdentity: (
      /**
       * The host we are connecting to.
       */
      host: string,
      /**
       * The server's certificate to check.
       */
      certToCheck: tls.PeerCertificate
    ): Maybe<Error> => {
      const pemToCheck = convertDERtoPEM(certToCheck.raw);

      if (pemToCheck !== pemToTrust) {
        logger.error('certificate is untrusted, insecure connection', { host });
        return new Error('[TLS:SOCKET:CERT:UNTRUSTED]');
      }

      if (!isValidForNow(certToCheck)) {
        const validFrom = certToCheck.valid_from;
        const validTo = certToCheck.valid_to;
        logger.error('certificate expired', { host, validFrom, validTo });
        return new Error(`[TLS:SOCKET:CERT:EXPIRED] ${validFrom} - ${validTo}`);
      }

      return; // certificate is valid
    },
  };
}

export function getPEM(pemOrCert: string | tls.PeerCertificate): string {
  if (typeof pemOrCert === 'string') {
    return pemOrCert;
  }
  return convertDERtoPEM(pemOrCert.raw);
}

/**
 * Converts DER encoded X.509 certificate data into PEM encoded.
 * https://github.com/nodejs/node-v0.x-archive/issues/8882#issuecomment-299318722
 * https://www.ssl.com/guide/pem-der-crt-and-cer-x-509-encodings-and-conversions/
 */
export function convertDERtoPEM(derCert: Buffer): string {
  const base64 = derCert.toString('base64');
  return `-----BEGIN CERTIFICATE-----\n${base64}\n-----END CERTIFICATE-----`;
}

export function isValidForDate(
  cert: crypto.X509Certificate | tls.PeerCertificate,
  date: Date
): boolean {
  const validFrom = getValidFrom(cert);
  const validTo = getValidTo(cert);
  return validFrom <= date && date <= validTo;
}

export function isValidForNow(
  cert: crypto.X509Certificate | tls.PeerCertificate
): boolean {
  return isValidForDate(cert, new Date());
}

export function getValidFrom(
  cert: crypto.X509Certificate | tls.PeerCertificate
): Date {
  let validFrom: string;
  if (cert instanceof crypto.X509Certificate) {
    validFrom = cert.validFrom;
  } else {
    validFrom = cert.valid_from;
  }
  return new Date(validFrom);
}

export function getValidTo(
  cert: crypto.X509Certificate | tls.PeerCertificate
): Date {
  let validTo: string;
  if (cert instanceof crypto.X509Certificate) {
    validTo = cert.validTo;
  } else {
    validTo = cert.valid_to;
  }
  return new Date(validTo);
}
