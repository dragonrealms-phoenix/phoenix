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

  setImmediate(() => {
    connectionListener?.();
    mockSocket.emitSecureConnectEvent();
  });

  return mockSocket as TLSSocketMock & tls.TLSSocket;
};

export class TLSSocketMock extends NetSocketMock {
  public secureConnectSpy: Mock;
  public getPeerCertificateSpy: Mock;

  private secureConnectListener?: () => void;

  constructor() {
    super();
    this.secureConnectSpy = vi.fn();
    this.getPeerCertificateSpy = vi.fn();
  }

  // -- Mock Test Functions -- //

  public emitSecureConnectEvent(): void {
    this.secureConnectSpy();
    this.secureConnectListener?.();
  }

  // -- Node.js TLS Socket Functions -- //

  public getPeerCertificate(): tls.PeerCertificate {
    return this.getPeerCertificateSpy();
  }

  public on(event: string, listener: (...args: Array<any>) => void): this {
    switch (event) {
      case 'secureConnect':
        this.secureConnectListener = listener;
        break;
      default:
        super.on(event, listener);
        break;
    }
    return this;
  }

  public removeListener(event: string): this {
    switch (event) {
      case 'secureConnect':
        this.secureConnectListener = undefined;
        break;
      default:
        super.removeListener(event);
        break;
    }
    return this;
  }
}
