import type * as tls from 'node:tls';
import type { Maybe } from '../../../common/types.js';
import { downloadCertificate } from '../../tls/download-certificate.js';
import { logger } from '../logger.js';

// As of November 2023, the login server's self-signed certificate
// is valid until Nov 16, 3017. We'll cache it in memory for performance.
let cachedTlsCertificate: Maybe<tls.PeerCertificate>;

/**
 * Gets the play.net login server's self-signed certificate.
 * Use this anytime we connect to the SGE server to get or send customer data.
 */
export const getTrustedTlsCertificate = async (
  connectOptions: tls.ConnectionOptions
): Promise<tls.PeerCertificate> => {
  const { host, port } = connectOptions;

  if (cachedTlsCertificate) {
    logger.debug('using cached login server certificate', { host, port });
    return cachedTlsCertificate;
  }

  logger.debug('downloading login server certificate', { host, port });
  cachedTlsCertificate = await downloadCertificate(connectOptions);

  return cachedTlsCertificate;
};
