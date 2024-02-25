import type tls from 'node:tls';
import type { Maybe } from '../../common/types.js';
import { convertDERtoPEM } from './convert-der-to-pem.js';
import { getPEM } from './get-pem.js';
import { isValidForNow } from './is-valid.js';
import { logger } from './logger.js';
import type { SelfSignedConnectOptions } from './types.js';

/**
 * Returns a subset of connection options to validate that a server's
 * self-signed certificate matches a PEM-encoded certificate you trust.
 *
 * Since it is self-signed, we cannot rely on core nodejs checks because
 * it flags those as insecure. And we don't want to disable all TLS checks
 * using `rejectUnauthorized: false` because that is foolish.
 */
export const createSelfSignedConnectOptions = (options: {
  certToTrust: string | tls.PeerCertificate;
}): SelfSignedConnectOptions => {
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
        return new Error(`[TLS:SOCKET:CERT:UNTRUSTED] ${host}`);
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
};
