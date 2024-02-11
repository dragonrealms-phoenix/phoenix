import * as tls from 'node:tls';
import merge from 'lodash-es/merge.js';
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
import { mockCreateLogger } from '../../../../common/__mocks__/create-logger.mock.js';
import type { Logger } from '../../../../common/logger/types.js';
import type { DeepPartial } from '../../../../common/types.js';
import {
  type TLSSocketMock,
  mockTLSConnect,
} from '../../../__mocks__/tls-socket.mock.js';
import type { SelfSignedConnectOptions } from '../../../tls/types.js';
import { connect } from '../connect.js';

const { mockGetTrustedTlsCertificate, mockCreateSelfSignedConnectOptions } =
  vi.hoisted(() => {
    const mockGetTrustedTlsCertificate = vi.fn();
    const mockCreateSelfSignedConnectOptions = vi.fn();

    return {
      mockGetTrustedTlsCertificate,
      mockCreateSelfSignedConnectOptions,
    };
  });

vi.mock('../get-tls-certificate.js', () => {
  return {
    getTrustedTlsCertificate: mockGetTrustedTlsCertificate,
  };
});

vi.mock('../../../tls/create-self-signed-connect-options.js', () => {
  return {
    createSelfSignedConnectOptions: mockCreateSelfSignedConnectOptions,
  };
});

type TLSModule = typeof import('node:tls');

vi.mock('node:tls', () => {
  const tlsMock: Partial<TLSModule> = {
    // Each test spies on `tls.connect` to specify their own socket to test.
    // Mocking the method here so that it can be spied upon as a mocked module.
    connect: vi.fn<[], tls.TLSSocket>(),
  };

  return tlsMock;
});

describe('connect', () => {
  const defaultConnectOptions: tls.ConnectionOptions = {
    host: 'eaccess.play.net',
    port: 7910,
    timeout: 5000,
  };

  const selfSignedConnectOptions: DeepPartial<SelfSignedConnectOptions> = {
    ca: 'test',
  };

  const mockPeerCert: DeepPartial<tls.PeerCertificate> = {
    subject: {
      C: 'test',
    },
  };

  let mockSocket: TLSSocketMock & tls.TLSSocket;
  let tlsConnectSpy: MockInstance;

  let logger: Logger;

  beforeAll(async () => {
    logger = await mockCreateLogger('test');
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
      mockSocket.getPeerCertificateSpy.mockReturnValue(mockPeerCert);

      return mockSocket;
    });

    mockGetTrustedTlsCertificate.mockResolvedValue(mockPeerCert);

    mockCreateSelfSignedConnectOptions.mockReturnValue(
      selfSignedConnectOptions
    );

    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#connect', () => {
    it('connects to socket with their self-signed certificate and default options', async () => {
      const mergedConnectOptions = merge(
        {},
        defaultConnectOptions,
        selfSignedConnectOptions
      );

      await connect();

      vi.runAllTimers(); // advance time to trigger the `connectionListener`

      expect(mockGetTrustedTlsCertificate).toHaveBeenCalledWith({
        host: mergedConnectOptions.host,
        port: mergedConnectOptions.port,
        timeout: mergedConnectOptions.timeout,
      });

      expect(mockCreateSelfSignedConnectOptions).toHaveBeenCalledWith({
        certToTrust: mockPeerCert,
      });

      expect(tlsConnectSpy).toHaveBeenCalledWith(
        mergedConnectOptions,
        expect.any(Function)
      );

      expect(mockSocket.connectSpy).toHaveBeenCalled();

      expect(logger.debug).toHaveBeenCalledWith('connecting to login server', {
        host: defaultConnectOptions.host,
        port: defaultConnectOptions.port,
      });

      expect(logger.debug).toHaveBeenCalledWith('connected to login server', {
        host: defaultConnectOptions.host,
        port: defaultConnectOptions.port,
      });
    });

    it('connects to socket with their self-signed certificate and custom options', async () => {
      const customConnectOptions: tls.ConnectionOptions = {
        host: 'dr.simutronics.net',
        port: 11024,
      };

      const mergedConnectOptions = merge(
        {},
        defaultConnectOptions,
        customConnectOptions,
        selfSignedConnectOptions
      );

      await connect(customConnectOptions);

      vi.runAllTimers();

      expect(mockGetTrustedTlsCertificate).toHaveBeenCalledWith({
        host: mergedConnectOptions.host,
        port: mergedConnectOptions.port,
        timeout: mergedConnectOptions.timeout,
      });

      expect(mockCreateSelfSignedConnectOptions).toHaveBeenCalledWith({
        certToTrust: mockPeerCert,
      });

      expect(tlsConnectSpy).toHaveBeenCalledWith(
        mergedConnectOptions,
        expect.any(Function)
      );

      expect(mockSocket.connectSpy).toHaveBeenCalled();

      expect(logger.debug).toHaveBeenCalledWith('connecting to login server', {
        host: customConnectOptions.host,
        port: customConnectOptions.port,
      });

      expect(logger.debug).toHaveBeenCalledWith('connected to login server', {
        host: customConnectOptions.host,
        port: customConnectOptions.port,
      });
    });

    it('logs when the socket emits an error', async () => {
      await connect();

      vi.runAllTimers();

      mockSocket.emitErrorEvent(new Error('test'));

      expect(logger.error).toHaveBeenCalledWith('login server error', {
        host: defaultConnectOptions.host,
        port: defaultConnectOptions.port,
        error: new Error('test'),
      });
    });

    it('logs when the socket times out', async () => {
      const timeout = 5000;

      await connect({ timeout });

      vi.runAllTimers();

      mockSocket.emitTimeoutEvent(timeout);

      expect(logger.error).toHaveBeenCalledWith(
        'login server inactivity timeout',
        {
          host: defaultConnectOptions.host,
          port: defaultConnectOptions.port,
          timeout,
        }
      );
    });

    it('logs when the socket is destroyed', async () => {
      await connect();

      vi.runAllTimers();

      mockSocket.destroy(); // emits 'end' then 'close' events

      expect(logger.debug).toHaveBeenCalledWith(
        'connection to login server ended',
        {
          host: defaultConnectOptions.host,
          port: defaultConnectOptions.port,
        }
      );

      expect(logger.debug).toHaveBeenCalledWith(
        'connection to login server closed',
        {
          host: defaultConnectOptions.host,
          port: defaultConnectOptions.port,
        }
      );
    });
  });
});
