import type { MockInstance, Mocked } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LogFormatterMock } from '../__mocks__/log-formatter.mock.js';
import { mockLogFormatterFactory } from '../__mocks__/log-formatter.mock.js';
import type { LogTransportMock } from '../__mocks__/log-transport.mock.js';
import { LogTransportMockImpl } from '../__mocks__/log-transport.mock.js';
import { LoggerImpl } from '../logger.js';
import type { LogFormatter, LogMessage, LogTransport } from '../types.js';
import { LogLevel } from '../types.js';

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

vi.useFakeTimers();

describe('logger', () => {
  let jsonStringifySpy: MockInstance<JSON['stringify']>;

  let mockLogMessage: LogMessage;
  let mockFlatLogMessage: LogMessage;

  let mockTransport: LogTransportMock;
  let mockFormatter: LogFormatterMock;

  let mockTransportConfig: {
    transport: LogTransport;
    formatter: LogFormatter;
    level?: LogLevel;
  };

  let logger: LoggerImpl;

  beforeEach(() => {
    jsonStringifySpy = vi.spyOn(JSON, 'stringify');

    // This is what's passed to the `logger.log(..)` method
    mockLogMessage = {
      scope: 'test-scope',
      level: LogLevel.DEBUG,
      message: 'test message',
      timestamp: new Date(),
      data: {
        foo: 'bar',
      },
    };

    // This is what the formatter will receive,
    // the log message's data flattened into the message itself
    mockFlatLogMessage = {
      ...mockLogMessage,
      ...mockLogMessage.data,
    };
    delete mockFlatLogMessage['data'];

    mockTransport = new LogTransportMockImpl();
    mockFormatter = mockLogFormatterFactory();

    mockTransportConfig = {
      transport: mockTransport,
      formatter: mockFormatter,
      level: LogLevel.INFO,
    };

    logger = new LoggerImpl({
      scope: 'test-scope',
      transports: [mockTransportConfig],
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
    jsonStringifySpy.mockRestore();
  });

  describe('#log', () => {
    it('should skip writing when log level is not enabled', async () => {
      mockLoggerUtils.isLogLevelEnabled.mockReturnValue(false);

      logger.log(mockLogMessage);

      expect(mockLoggerUtils.isLogLevelEnabled).toHaveBeenCalledTimes(1);
      expect(mockLoggerUtils.isLogLevelEnabled).toHaveBeenCalledWith(
        mockLogMessage.level
      );

      vi.clearAllMocks();
      await vi.advanceTimersToNextTimerAsync();

      expect(mockFormatter).not.toHaveBeenCalled();
      expect(mockTransport.write).not.toHaveBeenCalled();
    });

    it('should skip writing when transport does not support log level', async () => {
      mockLoggerUtils.isLogLevelEnabled
        .mockReturnValueOnce(true) // to satisfy the `log` call
        .mockReturnValue(false); // but block at the transport level

      logger.log(mockLogMessage);

      expect(mockLoggerUtils.isLogLevelEnabled).toHaveBeenCalledTimes(1);
      expect(mockLoggerUtils.isLogLevelEnabled).toHaveBeenCalledWith(
        mockLogMessage.level
      );

      vi.clearAllMocks();
      await vi.advanceTimersToNextTimerAsync();

      expect(mockLoggerUtils.isLogLevelEnabled).toHaveBeenCalledTimes(1);
      expect(mockLoggerUtils.isLogLevelEnabled).toHaveBeenCalledWith(
        mockTransportConfig.level
      );

      expect(mockFormatter).not.toHaveBeenCalled();
      expect(mockTransport.write).not.toHaveBeenCalled();
    });

    it('should skip writing when transport is not writable', async () => {
      mockLoggerUtils.isLogLevelEnabled.mockReturnValue(true);

      mockTransport.writable = false;

      logger.log(mockLogMessage);

      vi.clearAllMocks();
      await vi.advanceTimersToNextTimerAsync();

      expect(mockFormatter).not.toHaveBeenCalled();
      expect(mockTransport.write).not.toHaveBeenCalled();
    });

    it('should format and write log message to transport', async () => {
      mockLoggerUtils.isLogLevelEnabled.mockReturnValue(true);

      mockFormatter.mockReturnValue('test-formatted-message');

      logger.log(mockLogMessage);

      vi.clearAllMocks();
      await vi.advanceTimersToNextTimerAsync();

      expect(mockFormatter).toHaveBeenCalledTimes(1);
      expect(mockFormatter).toHaveBeenCalledWith([mockFlatLogMessage]);

      expect(mockTransport.write).toHaveBeenCalledTimes(1);
      expect(mockTransport.write).toHaveBeenCalledWith(
        'test-formatted-message',
        'utf8'
      );
    });

    it('should wait for drain event when transport buffer is full', async () => {
      mockLoggerUtils.isLogLevelEnabled.mockReturnValue(true);

      mockTransport.write.mockReturnValue(false);

      logger.log(mockLogMessage);

      vi.clearAllMocks();
      await vi.advanceTimersToNextTimerAsync();

      expect(mockTransport.write).toHaveBeenCalledTimes(1);

      expect(mockTransport.once).toHaveBeenCalledWith(
        'drain',
        expect.any(Function)
      );

      // Transport has not drained so the callback should not have been called.
      // The countdown latch should not have been decremented.
      expect((logger as any).asyncCountdownLatch).toBe(1);

      mockTransport.emit('drain');

      // Now the transport has drained and callback has decremented the latch.
      expect((logger as any).asyncCountdownLatch).toBe(0);
    });

    it('should write all queued messages together', async () => {
      mockLoggerUtils.isLogLevelEnabled.mockReturnValue(true);

      mockFormatter.mockReturnValueOnce('test-formatted-multiple-messages');

      // Log multiple times in the same event loop tick.
      logger.log(mockLogMessage);
      logger.log(mockLogMessage);

      vi.clearAllMocks();
      await vi.advanceTimersToNextTimerAsync();

      // When the node event loop that was receiving the `logger.log` calls
      // yields, the queued messages are passed as an array to the formatter.
      // Whatever string the formatter returns is written to the transport.
      expect(mockFormatter).toHaveBeenCalledTimes(1);
      expect(mockFormatter).toHaveBeenCalledWith([
        mockFlatLogMessage,
        mockFlatLogMessage,
      ]);

      expect(mockTransport.write).toHaveBeenCalledTimes(1);
      expect(mockTransport.write).toHaveBeenCalledWith(
        `test-formatted-multiple-messages`,
        'utf8'
      );
    });

    it('should write errors to console when formatter fails', async () => {
      mockLoggerUtils.isLogLevelEnabled.mockReturnValue(true);

      const consoleErrorSpy = vi.spyOn(console, 'error');

      mockFormatter.mockImplementation(() => {
        throw new Error('test-error');
      });

      logger.log(mockLogMessage);

      vi.clearAllMocks();
      await vi.advanceTimersToNextTimerAsync();

      expect(mockTransport.write).not.toHaveBeenCalled();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[LOGGER:WRITE:ERROR]',
        new Error('test-error')
      );
    });

    it('should write errors to console when transport fails', async () => {
      mockLoggerUtils.isLogLevelEnabled.mockReturnValue(true);

      const consoleErrorSpy = vi.spyOn(console, 'error');

      mockTransport.write.mockImplementation(() => {
        mockTransport.emit('error', new Error('test-error'));
        throw new Error('test-error');
      });

      logger.log(mockLogMessage);

      vi.clearAllMocks();
      await vi.advanceTimersToNextTimerAsync();

      expect(mockFormatter).toHaveBeenCalledTimes(1);
      expect(mockTransport.write).toHaveBeenCalledTimes(1);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[LOGGER:WRITE:ERROR]',
        new Error('test-error')
      );
    });

    it('should use default formatter and transport when none are provided', async () => {
      mockLoggerUtils.isLogLevelEnabled.mockReturnValue(true);

      // Default formatter uses JSON.stringify
      jsonStringifySpy.mockImplementation((_value) => {
        return '{"mocked":true}';
      });

      // Default transport uses process.stdout
      const transportSpy = vi.spyOn(process.stdout, 'write');

      const logger = new LoggerImpl({
        scope: 'test-scope',
      });

      logger.log(mockLogMessage);

      vi.clearAllMocks();
      await vi.advanceTimersToNextTimerAsync();

      expect(jsonStringifySpy).toHaveBeenCalledTimes(1);
      expect(jsonStringifySpy).toHaveBeenCalledWith([mockFlatLogMessage]);

      expect(transportSpy).toHaveBeenCalledTimes(1);
      expect(transportSpy).toHaveBeenCalledWith('{"mocked":true}', 'utf8');
    });

    it('should optimistically write to all transports even if one fails', async () => {
      mockLoggerUtils.isLogLevelEnabled.mockReturnValue(true);

      const consoleErrorSpy = vi.spyOn(console, 'error');

      const mockTransport2 = new LogTransportMockImpl();
      const mockFormatter2 = mockLogFormatterFactory();

      const mockTransportConfig2 = {
        transport: mockTransport2,
        formatter: mockFormatter2,
        level: LogLevel.INFO,
      };

      logger = new LoggerImpl({
        scope: 'test-scope',
        transports: [mockTransportConfig, mockTransportConfig2],
      });

      mockTransport.write.mockImplementation(() => {
        throw new Error('test-error');
      });

      logger.log(mockLogMessage);

      vi.clearAllMocks();
      await vi.advanceTimersToNextTimerAsync();

      expect(mockFormatter).toHaveBeenCalledTimes(1);
      expect(mockTransport.write).toHaveBeenCalledTimes(1);

      expect(mockFormatter2).toHaveBeenCalledTimes(1);
      expect(mockTransport2.write).toHaveBeenCalledTimes(1);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[LOGGER:WRITE:ERROR]',
        new Error('test-error')
      );
    });
  });
});
