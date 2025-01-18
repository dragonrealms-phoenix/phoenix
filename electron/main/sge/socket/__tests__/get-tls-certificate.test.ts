import type tls from 'node:tls';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockDownloadCertificate } = vi.hoisted(() => {
  const mockDownloadCertificate = vi.fn();

  return {
    mockDownloadCertificate,
  };
});

vi.mock('../../../tls/download-certificate.js', () => {
  return {
    downloadCertificate: mockDownloadCertificate,
  };
});

vi.mock('../../../logger/logger.factory.ts');

describe('get-tls-certificate', () => {
  const connectOptions: tls.ConnectionOptions = {
    host: 'test-host',
    port: 1234,
  };

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();

    // Because the certificate is cached once downloaded,
    // we need to reset the modules so that they start with a fresh state.
    vi.resetModules();
  });

  describe('#getTrustedTlsCertificate', () => {
    it('downloads the server certificate', async () => {
      // Because we reset the modules after each test, we must import again.
      const getTlsCertModule = await import('../get-tls-certificate.js');
      const { getTrustedTlsCertificate } = getTlsCertModule;

      const mockCert = {
        raw: Buffer.from('test-cert'),
      } as tls.PeerCertificate;

      mockDownloadCertificate.mockResolvedValueOnce(mockCert);

      const trustedCert = await getTrustedTlsCertificate(connectOptions);

      expect(trustedCert).toBe(mockCert);

      expect(mockDownloadCertificate).toHaveBeenCalledTimes(1);
    });

    it('caches the server certificate', async () => {
      // Because we reset the modules after each test, we must import again.
      const getTlsCertModule = await import('../get-tls-certificate.js');
      const { getTrustedTlsCertificate } = getTlsCertModule;

      const mockCert1 = {
        raw: Buffer.from('test-cert-1'),
      } as tls.PeerCertificate;

      const mockCert2 = {
        raw: Buffer.from('test-cert-2'),
      } as tls.PeerCertificate;

      mockDownloadCertificate.mockResolvedValueOnce(mockCert1);
      mockDownloadCertificate.mockResolvedValueOnce(mockCert2);

      const trustedCert1 = await getTrustedTlsCertificate(connectOptions);
      expect(trustedCert1).toBe(mockCert1);

      const trustedCert2 = await getTrustedTlsCertificate(connectOptions);
      expect(trustedCert2).toBe(mockCert1); // returns cached certifiate

      expect(mockDownloadCertificate).toHaveBeenCalledTimes(1);
    });
  });
});
