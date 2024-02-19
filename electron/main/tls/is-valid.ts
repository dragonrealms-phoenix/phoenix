import crypto from 'node:crypto';
import type tls from 'node:tls';

export const isValidForDate = (
  cert: crypto.X509Certificate | tls.PeerCertificate,
  date: Date
): boolean => {
  const validFrom = getValidFrom(cert);
  const validTo = getValidTo(cert);
  return validFrom <= date && date <= validTo;
};

export const isValidForNow = (
  cert: crypto.X509Certificate | tls.PeerCertificate
): boolean => {
  return isValidForDate(cert, new Date());
};

export const getValidFrom = (
  cert: crypto.X509Certificate | tls.PeerCertificate
): Date => {
  let validFrom: string;
  if (cert instanceof crypto.X509Certificate) {
    validFrom = cert.validFrom;
  } else {
    validFrom = cert.valid_from;
  }
  return new Date(validFrom);
};

export const getValidTo = (
  cert: crypto.X509Certificate | tls.PeerCertificate
): Date => {
  let validTo: string;
  if (cert instanceof crypto.X509Certificate) {
    validTo = cert.validTo;
  } else {
    validTo = cert.valid_to;
  }
  return new Date(validTo);
};
