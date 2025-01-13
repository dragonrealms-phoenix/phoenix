import type { Mocked } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LogTransporterMock } from '../../../common/logger/__mocks__/transporter.mock.js';
import { LogTransporterMockImpl } from '../../../common/logger/__mocks__/transporter.mock.js';
import type {
  LogMessage,
  LogTransportConfig,
} from '../../../common/logger/types.js';
import { LogLevel } from '../../../common/logger/types.js';
import { LoggerImpl } from '../logger.js';

type LoggerUtilsModule = typeof import('../logger.utils.js');

const { mockLoggerUtils } = await vi.hoisted(async () => {
  const mockLoggerUtils: Mocked<
    Pick<LoggerUtilsModule, 'getLogLevel' | 'isLogLevelEnabled'>
  > = {
    getLogLevel: vi.fn(),
    isLogLevelEnabled: vi.fn(),
  };

  return {
    mockLoggerUtils,
  };
});

vi.mock('../logger.utils.js', () => {
  return mockLoggerUtils;
});

describe('logger', () => {
  let mockLogMessage: LogMessage;
  let mockFlatLogMessage: LogMessage;
  let mockTransporter: LogTransporterMock;
  let mockLogTransportConfig: LogTransportConfig;

  let logger: LoggerImpl;

  beforeEach(() => {
    // This is what's passed to the `logger.log(..)` method
    mockLogMessage = {
      level: LogLevel.DEBUG,
      scope: 'test-scope',
      message: 'test message',
      timestamp: new Date(),
      data: {
        foo: 'bar',
      },
    };

    // This is what the transporter will receive,
    // the log message's data flattened into the message itself
    mockFlatLogMessage = {
      ...mockLogMessage,
      ...mockLogMessage.data,
    };
    delete mockFlatLogMessage['data'];

    mockTransporter = new LogTransporterMockImpl();

    mockLogTransportConfig = {
      transporter: mockTransporter,
      level: LogLevel.INFO,
    };

    logger = new LoggerImpl({
      scope: 'test-scope',
      transports: [mockLogTransportConfig],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('#log', () => {
    it('should skip when log level is not enabled', () => {
      mockLoggerUtils.isLogLevelEnabled.mockReturnValue(false);

      logger.log(mockLogMessage);

      expect(mockLoggerUtils.isLogLevelEnabled).toHaveBeenCalledTimes(1);
      expect(mockLoggerUtils.isLogLevelEnabled).toHaveBeenCalledWith(
        mockLogMessage.level
      );

      expect(mockTransporter.transport).not.toHaveBeenCalled();
    });

    it('should skip when transporter does not support log level', () => {
      mockLoggerUtils.isLogLevelEnabled
        .mockReturnValueOnce(true) // to satisfy the `log` call
        .mockReturnValue(false); // but block at the transporter level

      logger.log(mockLogMessage);

      expect(mockLoggerUtils.isLogLevelEnabled).toHaveBeenCalledTimes(2);

      expect(mockLoggerUtils.isLogLevelEnabled).toHaveBeenNthCalledWith(
        1,
        mockLogMessage.level
      );

      expect(mockLoggerUtils.isLogLevelEnabled).toHaveBeenNthCalledWith(
        2,
        mockLogTransportConfig.level
      );

      expect(mockTransporter.transport).not.toHaveBeenCalled();
    });

    it('should send log message to transport', async () => {
      mockLoggerUtils.isLogLevelEnabled.mockReturnValue(true);

      logger.log(mockLogMessage);

      expect(mockTransporter.transport).toHaveBeenCalledTimes(1);
      expect(mockTransporter.transport).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockFlatLogMessage,
          timestamp: expect.any(Date),
        })
      );
    });

    it('should write errors to console when transporter fails', async () => {
      mockLoggerUtils.isLogLevelEnabled.mockReturnValue(true);

      const consoleErrorSpy = vi.spyOn(console, 'error');

      mockTransporter.transport.mockImplementation(() => {
        throw new Error('test-error');
      });

      logger.log(mockLogMessage);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[LOGGER:TRANSPORT:ERROR]',
        new Error('test-error')
      );
    });

    it('should use default transporter when none are provided', async () => {
      mockLoggerUtils.isLogLevelEnabled.mockReturnValue(true);

      const transporterSpy = vi.spyOn(console, 'log');

      const logger = new LoggerImpl({
        scope: 'test-scope',
      });

      logger.log(mockLogMessage);

      expect(transporterSpy).toHaveBeenCalledTimes(1);
      expect(transporterSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockFlatLogMessage,
          timestamp: expect.any(Date),
        })
      );
    });

    it('should optimistically write to all transporters even if one fails', async () => {
      mockLoggerUtils.isLogLevelEnabled.mockReturnValue(true);

      const consoleErrorSpy = vi.spyOn(console, 'error');

      const mockTransport2 = new LogTransporterMockImpl();

      const mockTransportConfig2: LogTransportConfig = {
        transporter: mockTransport2,
        level: LogLevel.INFO,
      };

      logger = new LoggerImpl({
        scope: 'test-scope',
        transports: [mockLogTransportConfig, mockTransportConfig2],
      });

      mockTransporter.transport.mockImplementation(() => {
        throw new Error('test-error');
      });

      logger.log(mockLogMessage);

      expect(mockTransporter.transport).toHaveBeenCalledTimes(1);

      expect(mockTransport2.transport).toHaveBeenCalledTimes(1);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[LOGGER:TRANSPORT:ERROR]',
        new Error('test-error')
      );
    });
  });
});
