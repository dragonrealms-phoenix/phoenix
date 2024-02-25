/**
 * Converts DER encoded X.509 certificate data into PEM encoded.
 * https://github.com/nodejs/node-v0.x-archive/issues/8882#issuecomment-299318722
 * https://www.ssl.com/guide/pem-der-crt-and-cer-x-509-encodings-and-conversions/
 */
export const convertDERtoPEM = (derCert: Buffer): string => {
  const base64 = derCert.toString('base64');
  return `-----BEGIN CERTIFICATE-----\n${base64}\n-----END CERTIFICATE-----`;
};
