import type * as tls from 'node:tls';
import type { Mock } from 'vitest';
import { vi } from 'vitest';
import { NetSocketMock } from './net-socket.mock.js';

/**
 * For mocking the `tls.connect()` static method.
 * Retuns a function that when called creates a new `TLSSocketMock` instance.
 */
export const mockTLSConnect = (
  connectOptions: string | tls.ConnectionOptions,
  connectionListener?: () => void
): TLSSocketMock & tls.TLSSocket => {
  const mockSocket = new TLSSocketMock();

  mockSocket.connect(connectOptions);

  connectionListener?.();

  return mockSocket as TLSSocketMock & tls.TLSSocket;
};

export class TLSSocketMock extends NetSocketMock {
  public getPeerCertificateSpy: Mock;

  constructor() {
    super();
    this.getPeerCertificateSpy = vi.fn();
  }

  // -- Node.js TLS Socket Functions -- //

  public getPeerCertificate(): tls.PeerCertificate {
    return this.getPeerCertificateSpy();
  }
}
