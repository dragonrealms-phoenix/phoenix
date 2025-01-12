import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LogLevel, type LogMessage } from '../../../../common/logger/types.js';
import type { LogFormatterMock } from '../../__mocks__/log-formatter.mock.js';
import { LogFormatterMockImpl } from '../../__mocks__/log-formatter.mock.js';
import { FileLogTransporterImpl } from '../file.transporter.js';

const { mockWritable, mockCreateWriteStream } = await vi.hoisted(async () => {
  const mockWritableModule = await import(
    '../../../__mocks__/writable.mock.js'
  );
  const { WritableMockImpl } = mockWritableModule;

  const mockWritable = new WritableMockImpl();

  const mockCreateWriteStream = vi.fn().mockImplementation(() => mockWritable);

  return {
    mockWritable,
    mockCreateWriteStream,
  };
});

vi.mock('fs-extra', () => {
  return {
    default: {
      createWriteStream: mockCreateWriteStream,
    },
  };
});

describe('file-log-transporter', () => {
  let mockLogMessage: LogMessage;
  let mockFormatter: LogFormatterMock;

  let transporter: FileLogTransporterImpl;

  beforeEach(() => {
    mockLogMessage = {
      level: LogLevel.INFO,
      scope: 'test-scope',
      message: 'test-message',
      timestamp: new Date(),
      data: {},
    };

    mockFormatter = new LogFormatterMockImpl();

    transporter = new FileLogTransporterImpl({
      filePath: '/test/path/log.txt',
      append: true,
      encoding: 'utf8',
      formatter: mockFormatter,
    });

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#constructor', () => {
    it('should create a file write stream', () => {
      expect(mockCreateWriteStream).toHaveBeenCalledTimes(1);
      expect(mockCreateWriteStream).toHaveBeenCalledWith('/test/path/log.txt', {
        flags: 'a',
        encoding: 'utf8',
      });
    });
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

    // The file transporter is a small wrapper of the writable transporter.
    // For more tests, see the writable transporter test file.
  });
});
