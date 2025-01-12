import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LogLevel, type LogMessage } from '../../../../common/logger/types.js';
import { WritableMockImpl } from '../../../__mocks__/writable.mock.js';
import type { LogFormatterMock } from '../../__mocks__/log-formatter.mock.js';
import { LogFormatterMockImpl } from '../../__mocks__/log-formatter.mock.js';
import { WritableLogTransporterImpl } from '../writable.transporter.js';

describe('writable-log-transporter', () => {
  let mockLogMessage: LogMessage;
  let mockFormatter: LogFormatterMock;
  let mockWritable: WritableMockImpl;

  let transporter: WritableLogTransporterImpl;

  beforeEach(() => {
    mockLogMessage = {
      level: LogLevel.INFO,
      scope: 'test-scope',
      message: 'test-message',
      timestamp: new Date(),
      data: {},
    };

    mockFormatter = new LogFormatterMockImpl();

    mockWritable = new WritableMockImpl();

    transporter = new WritableLogTransporterImpl({
      writable: mockWritable,
      formatter: mockFormatter,
    });

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#transport', () => {
    it('should log the message to the writable', async () => {
      mockFormatter.format = vi.fn(); // noop formatter

      transporter.transport(mockLogMessage);

      expect(mockFormatter.format).toHaveBeenCalledTimes(0);
      expect(mockWritable.write).toHaveBeenCalledTimes(0);

      vi.clearAllMocks();
      await vi.advanceTimersToNextTimerAsync();

      expect(mockFormatter.format).toHaveBeenCalledWith(mockLogMessage);
      expect(mockWritable.write).toHaveBeenCalledWith(mockLogMessage);
    });

    it('should log the formatted message to the writable', async () => {
      mockFormatter.format.mockReturnValue('test-formatted-message');

      transporter.transport(mockLogMessage);

      expect(mockFormatter.format).toHaveBeenCalledTimes(0);
      expect(mockWritable.write).toHaveBeenCalledTimes(0);

      vi.clearAllMocks();
      await vi.advanceTimersToNextTimerAsync();

      expect(mockFormatter.format).toHaveBeenCalledWith(mockLogMessage);
      expect(mockWritable.write).toHaveBeenCalledWith('test-formatted-message');
    });

    it('should log each message in the queue', async () => {
      mockFormatter.format.mockImplementation((message) => {
        return message.message;
      });

      const mockMessage1 = {
        ...mockLogMessage,
        message: 'test-message-1',
      };

      const mockMessage2 = {
        ...mockLogMessage,
        message: 'test-message-2',
      };

      const mockMessage3 = {
        ...mockLogMessage,
        message: 'test-message-3',
      };

      transporter.transport(mockMessage1);
      transporter.transport(mockMessage2);
      transporter.transport(mockMessage3);

      expect(mockFormatter.format).toHaveBeenCalledTimes(0);
      expect(mockWritable.write).toHaveBeenCalledTimes(0);

      vi.clearAllMocks();
      await vi.advanceTimersToNextTimerAsync();

      expect(mockFormatter.format).toHaveBeenCalledTimes(3);
      expect(mockWritable.write).toHaveBeenCalledTimes(3);

      expect(mockWritable.write).toHaveBeenNthCalledWith(1, 'test-message-1');
      expect(mockWritable.write).toHaveBeenNthCalledWith(2, 'test-message-2');
      expect(mockWritable.write).toHaveBeenNthCalledWith(3, 'test-message-3');
    });

    it('should wait for the drain event to continue writing', async () => {
      mockWritable.write.mockReturnValueOnce(false);

      const mockMessage1 = {
        ...mockLogMessage,
        message: 'test-message-1',
      };

      const mockMessage2 = {
        ...mockLogMessage,
        message: 'test-message-2',
      };

      transporter.transport(mockMessage1);
      transporter.transport(mockMessage2);

      expect(mockFormatter.format).toHaveBeenCalledTimes(0);
      expect(mockWritable.write).toHaveBeenCalledTimes(0);

      vi.clearAllMocks();
      await vi.advanceTimersToNextTimerAsync();

      // After the first write, the logger will wait for the 'drain' event
      // before continuining. The other message will be queued.
      expect(mockFormatter.format).toHaveBeenCalledTimes(1);
      expect(mockWritable.write).toHaveBeenCalledTimes(1);

      expect(mockWritable.write).toHaveBeenCalledWith(mockMessage1);

      // Assert that the delay is not just due to async nature of the write.
      vi.clearAllMocks();
      await vi.advanceTimersToNextTimerAsync();

      expect(mockFormatter.format).toHaveBeenCalledTimes(0);
      expect(mockWritable.write).toHaveBeenCalledTimes(0);

      // Emit the 'drain' event to continue writing.
      mockWritable.write.mockReturnValue(true);
      mockWritable.emit('drain');

      vi.clearAllMocks();
      await vi.advanceTimersToNextTimerAsync();

      // The second message should be written now.
      expect(mockFormatter.format).toHaveBeenCalledTimes(1);
      expect(mockWritable.write).toHaveBeenCalledTimes(1);

      expect(mockWritable.write).toHaveBeenCalledWith(mockMessage2);
    });

    it('should log write errors to console and continue writing', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');

      const mockError = new Error('test-error');

      mockWritable.write.mockImplementationOnce(() => {
        throw mockError;
      });

      const mockMessage1 = {
        ...mockLogMessage,
        message: 'test-message-1',
      };

      const mockMessage2 = {
        ...mockLogMessage,
        message: 'test-message-2',
      };

      transporter.transport(mockMessage1);
      transporter.transport(mockMessage2);

      expect(mockFormatter.format).toHaveBeenCalledTimes(0);
      expect(mockWritable.write).toHaveBeenCalledTimes(0);

      vi.clearAllMocks();
      await vi.advanceTimersToNextTimerAsync();

      expect(mockFormatter.format).toHaveBeenCalledTimes(2);
      expect(mockWritable.write).toHaveBeenCalledTimes(2);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[LOGGER:WRITE:ERROR]',
        mockError
      );
    });

    it('should log emitted errors to console', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');

      const mockError = new Error('test-error');

      transporter.transport(mockLogMessage);

      mockWritable.emit('error', mockError);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[LOGGER:WRITE:ERROR]',
        mockError
      );
    });
  });
});
