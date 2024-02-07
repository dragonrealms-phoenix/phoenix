import type * as tls from 'node:tls';
import { describe, expect, it } from 'vitest';
import { getPEM } from '../get-pem.js';

describe('get-pem', () => {
  const buffer = Buffer.from('test');
  const base64 = buffer.toString('base64');
  const pem = `-----BEGIN CERTIFICATE-----\n${base64}\n-----END CERTIFICATE-----`;

  describe('#getPEM', () => {
    it('returns the input string if it is a string', () => {
      expect(getPEM(pem)).toBe(pem);
    });

    it('converts the raw certificate to PEM format', () => {
      const certificate = {
        raw: buffer,
      } as tls.PeerCertificate;

      expect(getPEM(certificate)).toBe(pem);
    });
  });
});
