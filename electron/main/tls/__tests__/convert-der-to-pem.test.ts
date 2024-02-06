import { describe, expect, it } from 'vitest';
import { convertDERtoPEM } from '../convert-der-to-pem.js';

describe('convert-der-to-pem', () => {
  it('converts DER encoded certificate to PEM format', () => {
    const derCert = Buffer.from('test-der-cert-data');
    const derCertBase64 = derCert.toString('base64');

    const expected = `-----BEGIN CERTIFICATE-----\n${derCertBase64}\n-----END CERTIFICATE-----`;
    const actual = convertDERtoPEM(derCert);

    expect(actual).toBe(expected);
  });
});
