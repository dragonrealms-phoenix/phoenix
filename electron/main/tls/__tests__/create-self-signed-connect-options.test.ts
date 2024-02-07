import type * as tls from 'node:tls';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSelfSignedConnectOptions } from '../create-self-signed-connect-options.js';
import { getPEM } from '../get-pem.js';
import type { SelfSignedConnectOptions } from '../types.js';

describe('create-self-signed-connect-options', () => {
  let trustedCert: tls.PeerCertificate;
  let untrustedCert: tls.PeerCertificate;
  let expiredCert: tls.PeerCertificate;
  let connectOptions: SelfSignedConnectOptions;

  beforeEach(() => {
    const yesterday = new Date('2022-01-01T00:00:00Z');
    const today = new Date('2022-01-02T00:00:00Z');
    const tomorrow = new Date('2022-01-03T00:00:00Z');

    vi.useFakeTimers({
      shouldAdvanceTime: true,
      now: today,
    });

    trustedCert = {
      raw: Buffer.from('test-cert-to-trust'),
      valid_from: yesterday.toISOString(),
      valid_to: tomorrow.toISOString(),
    } as tls.PeerCertificate;

    untrustedCert = {
      ...trustedCert,
      raw: Buffer.from('test-cert-to-untrust'),
    } as tls.PeerCertificate;

    expiredCert = {
      ...trustedCert,
      valid_from: yesterday.toISOString(),
      valid_to: yesterday.toISOString(),
    } as tls.PeerCertificate;

    connectOptions = createSelfSignedConnectOptions({
      certToTrust: trustedCert,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#createSelfSignedConnectOptions', () => {
    it('creates self-signed connect options', () => {
      expect(connectOptions).toEqual({
        ca: [getPEM(trustedCert)],
        requestCert: true,
        checkServerIdentity: expect.any(Function),
      });
    });

    it('accepts trusted certificates', () => {
      const { checkServerIdentity } = connectOptions;

      expect(
        checkServerIdentity('https://trust.me', trustedCert)
      ).toBeUndefined();
    });

    it('rejects untrusted certificates', () => {
      const { checkServerIdentity } = connectOptions;

      expect(checkServerIdentity('http://h4k0rz.io', untrustedCert)).toEqual(
        new Error(`[TLS:SOCKET:CERT:UNTRUSTED] http://h4k0rz.io`)
      );
    });

    it('rejects expired certificates', () => {
      const { checkServerIdentity } = connectOptions;

      expect(checkServerIdentity('https://trust.me', expiredCert)).toEqual(
        new Error(
          `[TLS:SOCKET:CERT:EXPIRED] ${expiredCert.valid_from} - ${expiredCert.valid_to}`
        )
      );
    });
  });
});
