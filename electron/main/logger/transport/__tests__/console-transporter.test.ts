import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LogLevel, type LogMessage } from '../../../../common/logger/types.js';
import type { LogFormatterMock } from '../../__mocks__/formatter.mock.js';
import { LogFormatterMockImpl } from '../../__mocks__/formatter.mock.js';
import { ConsoleLogTransporterImpl } from '../console.transporter.js';

describe('console-log-transporter', () => {
  let mockLogMessage: LogMessage;
  let mockFormatter: LogFormatterMock;

  let transporter: ConsoleLogTransporterImpl;

  beforeEach(() => {
    mockLogMessage = {
      level: LogLevel.INFO,
      scope: 'test-scope',
      message: 'test-message',
      timestamp: new Date(),
      data: {},
    };

    mockFormatter = new LogFormatterMockImpl();

    transporter = new ConsoleLogTransporterImpl({
      formatter: mockFormatter,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('#transport', () => {
    it('should log the message to the console', async () => {
      mockFormatter.format = vi.fn(); // noop formatter

      const consoleInfoSpy = vi.spyOn(console, 'info');

      transporter.transport(mockLogMessage);

      expect(consoleInfoSpy).toHaveBeenCalledWith(mockLogMessage);
    });

    it('should log the formatted message to the console', async () => {
      mockFormatter.format.mockReturnValue('test-formatted-message');

      const consoleInfoSpy = vi.spyOn(console, 'info');

      transporter.transport(mockLogMessage);

      expect(consoleInfoSpy).toHaveBeenCalledWith('test-formatted-message');
    });

    it('uses console.debug for trace level', async () => {
      mockLogMessage.level = LogLevel.TRACE;

      mockFormatter.format.mockReturnValue('test-formatted-message');

      const consoleDebugSpy = vi.spyOn(console, 'debug');

      transporter.transport(mockLogMessage);

      expect(consoleDebugSpy).toHaveBeenCalledWith('test-formatted-message');
    });

    it('uses console.debug for debug level', async () => {
      mockLogMessage.level = LogLevel.DEBUG;

      mockFormatter.format.mockReturnValue('test-formatted-message');

      const consoleDebugSpy = vi.spyOn(console, 'debug');

      transporter.transport(mockLogMessage);

      expect(consoleDebugSpy).toHaveBeenCalledWith('test-formatted-message');
    });

    it('uses console.info for info level', async () => {
      mockLogMessage.level = LogLevel.INFO;

      mockFormatter.format.mockReturnValue('test-formatted-message');

      const consoleInfoSpy = vi.spyOn(console, 'info');

      transporter.transport(mockLogMessage);

      expect(consoleInfoSpy).toHaveBeenCalledWith('test-formatted-message');
    });

    it('uses console.warn for warn level', async () => {
      mockLogMessage.level = LogLevel.WARN;

      mockFormatter.format.mockReturnValue('test-formatted-message');

      const consoleWarnSpy = vi.spyOn(console, 'warn');

      transporter.transport(mockLogMessage);

      expect(consoleWarnSpy).toHaveBeenCalledWith('test-formatted-message');
    });

    it('uses console.error for error level', async () => {
      mockLogMessage.level = LogLevel.ERROR;

      mockFormatter.format.mockReturnValue('test-formatted-message');

      const consoleErrorSpy = vi.spyOn(console, 'error');

      transporter.transport(mockLogMessage);

      expect(consoleErrorSpy).toHaveBeenCalledWith('test-formatted-message');
    });

    it('uses console.log for unknown log levels', async () => {
      mockLogMessage.level = 'unknown' as LogLevel;

      mockFormatter.format.mockReturnValue('test-formatted-message');

      const consoleLogSpy = vi.spyOn(console, 'log');

      transporter.transport(mockLogMessage);

      expect(consoleLogSpy).toHaveBeenCalledWith('test-formatted-message');
    });
  });
});
