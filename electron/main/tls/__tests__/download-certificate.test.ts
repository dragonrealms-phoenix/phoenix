import tls from 'node:tls';
import type { MockInstance } from 'vitest';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import type { DeepPartial } from '../../../common/types.js';
import {
  type TLSSocketMock,
  mockTLSConnect,
} from '../../__mocks__/tls-socket.mock.js';
import { downloadCertificate } from '../download-certificate.js';

type TLSModule = typeof import('node:tls');

vi.mock('node:tls', () => {
  const tlsMock: Partial<TLSModule> = {
    // Each test spies on `tls.connect` to specify their own socket to test.
    // Mocking the method here so that it can be spied upon as a mocked module.
    connect: vi.fn<() => tls.TLSSocket>(),
  };

  return {
    default: tlsMock,
  };
});

vi.mock('../../logger/logger.factory.ts');

describe('download-certificate', () => {
  const mockPeerCert: DeepPartial<tls.PeerCertificate> = {
    subject: {
      C: 'test',
    },
  };

  let mockSocket: TLSSocketMock & tls.TLSSocket;
  let tlsConnectSpy: MockInstance;

  beforeAll(() => {
    tlsConnectSpy = vi.spyOn(tls, 'connect');
  });

  beforeEach(() => {
    tlsConnectSpy.mockImplementationOnce((...args): tls.TLSSocket => {
      // Technically, the `tls.connect()` method accepts various arguments.
      // For this test, we know it's invoked with these two arguments.
      const connectionOptions = args[0] as tls.ConnectionOptions;
      const connectionListener = args[1] as () => void;
      mockSocket = mockTLSConnect(connectionOptions, connectionListener);

      // Mock the peer certificate that would be returned from the server.
      mockSocket.getPeerCertificateSpy.mockReturnValueOnce(mockPeerCert);

      return mockSocket;
    });

    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#downloadCertificate', () => {
    it('connects to server and resolves with the peer certificate', async () => {
      const promise = downloadCertificate({
        host: 'test-host',
        port: 1234,
      });

      await expect(promise).resolves.toEqual(mockPeerCert);

      expect(mockSocket.connectSpy).toHaveBeenCalledWith({
        host: 'test-host',
        port: 1234,
        rejectUnauthorized: false,
      });

      expect(mockSocket.secureConnectSpy).toHaveBeenCalled();
      expect(mockSocket.getPeerCertificateSpy).toHaveBeenCalled();
      expect(mockSocket.destroySpy).toHaveBeenCalled();
    });

    it('rejects when the socket emits an error', async () => {
      const promise = downloadCertificate({
        host: 'test-host',
        port: 1234,
      });

      mockSocket.emitErrorEvent(new Error('test'));

      await expect(promise).rejects.toThrowError(
        new Error('[TLS:SOCKET:ERROR:ERROR] test')
      );

      expect(mockSocket.destroySpy).toHaveBeenCalled();
    });

    it('rejects when the socket times out', async () => {
      const timeout = 5000;

      const promise = downloadCertificate({
        host: 'test-host',
        port: 1234,
        timeout,
      });

      mockSocket.emitTimeoutEvent(timeout);

      await expect(promise).rejects.toThrowError(
        new Error(`[TLS:SOCKET:STATUS:TIMEOUT] ${timeout}`)
      );

      expect(mockSocket.destroySpy).toHaveBeenCalled();
    });
  });
});
