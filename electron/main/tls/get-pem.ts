import type * as tls from 'node:tls';
import { convertDERtoPEM } from './convert-der-to-pem.js';

export const getPEM = (pemOrCert: string | tls.PeerCertificate): string => {
  if (typeof pemOrCert === 'string') {
    return pemOrCert;
  }
  return convertDERtoPEM(pemOrCert.raw);
};
