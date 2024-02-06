import * as crypto from 'node:crypto';
import type * as tls from 'node:tls';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Writeable } from '../../../common/types.js';
import {
  getValidFrom,
  getValidTo,
  isValidForDate,
  isValidForNow,
} from '../is-valid.js';

describe('is-valid', () => {
  const yesterday = new Date('2022-01-01T00:00:00Z');
  const today = new Date('2022-01-02T00:00:00Z');
  const tomorrow = new Date('2022-01-03T00:00:00Z');

  let mockX509Cert: Writeable<crypto.X509Certificate>;
  let mockPeerCert: Writeable<tls.PeerCertificate>;

  beforeEach(() => {
    vi.useFakeTimers({
      shouldAdvanceTime: true,
      now: today,
    });

    // Instantiating a new X509Certificate object requires a valid certificate.
    // I didn't want to generate that string so instead mocked the prototype.
    mockX509Cert = {
      validFrom: today.toISOString(),
      validTo: tomorrow.toISOString(),
    } as crypto.X509Certificate;
    Object.setPrototypeOf(mockX509Cert, crypto.X509Certificate.prototype);

    // No prototype needed here since tls.PeerCertificate is a type interface.
    mockPeerCert = {
      valid_from: today.toISOString(),
      valid_to: tomorrow.toISOString(),
    } as tls.PeerCertificate;
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#isValidForDate', () => {
    it('validates X509Certificate', () => {
      expect(isValidForDate(mockX509Cert, yesterday)).toBe(false);
      expect(isValidForDate(mockX509Cert, today)).toBe(true);
      expect(isValidForDate(mockX509Cert, tomorrow)).toBe(true);
    });

    it('validates PeerCertificate', () => {
      expect(isValidForDate(mockPeerCert, yesterday)).toBe(false);
      expect(isValidForDate(mockPeerCert, today)).toBe(true);
      expect(isValidForDate(mockPeerCert, tomorrow)).toBe(true);
    });
  });

  describe('#isValidForNow', () => {
    it('validates X509Certificate', () => {
      // Too old
      mockX509Cert.validFrom = yesterday.toISOString();
      mockX509Cert.validTo = yesterday.toISOString();
      expect(isValidForNow(mockX509Cert)).toBe(false);

      // Same date
      mockX509Cert.validFrom = today.toISOString();
      mockX509Cert.validTo = today.toISOString();
      expect(isValidForNow(mockX509Cert)).toBe(true);

      // Too new
      mockX509Cert.validFrom = tomorrow.toISOString();
      mockX509Cert.validTo = tomorrow.toISOString();
      expect(isValidForNow(mockX509Cert)).toBe(false);

      // Same range
      mockX509Cert.validFrom = yesterday.toISOString();
      mockX509Cert.validTo = tomorrow.toISOString();
      expect(isValidForNow(mockX509Cert)).toBe(true);
    });

    it('validates PeerCertificate', () => {
      // Too old
      mockPeerCert.valid_from = yesterday.toISOString();
      mockPeerCert.valid_to = yesterday.toISOString();
      expect(isValidForNow(mockPeerCert)).toBe(false);

      // Same date
      mockPeerCert.valid_from = today.toISOString();
      mockPeerCert.valid_to = today.toISOString();
      expect(isValidForNow(mockPeerCert)).toBe(true);

      // Too new
      mockPeerCert.valid_from = tomorrow.toISOString();
      mockPeerCert.valid_to = tomorrow.toISOString();
      expect(isValidForNow(mockPeerCert)).toBe(false);

      // Same range
      mockPeerCert.valid_from = yesterday.toISOString();
      mockPeerCert.valid_to = tomorrow.toISOString();
      expect(isValidForNow(mockPeerCert)).toBe(true);
    });
  });

  describe('#getValidFrom', () => {
    it('returns the validFrom date', () => {
      expect(getValidFrom(mockX509Cert)).toEqual(today);
      expect(getValidFrom(mockPeerCert)).toEqual(today);
    });
  });

  describe('#getValidTo', () => {
    it('returns the validTo date', () => {
      expect(getValidTo(mockX509Cert)).toEqual(tomorrow);
      expect(getValidTo(mockPeerCert)).toEqual(tomorrow);
    });
  });
});
