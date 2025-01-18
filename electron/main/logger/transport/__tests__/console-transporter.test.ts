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
    it('should log the message to the console', () => {
      mockFormatter.format = vi.fn(); // noop formatter

      const consoleInfoSpy = vi.spyOn(console, 'info');

      transporter.transport(mockLogMessage);

      expect(consoleInfoSpy).toHaveBeenCalledWith(mockLogMessage);
    });

    it('should log the formatted message to the console', () => {
      mockFormatter.format.mockReturnValue('test-formatted-message');

      const consoleInfoSpy = vi.spyOn(console, 'info');

      transporter.transport(mockLogMessage);

      expect(consoleInfoSpy).toHaveBeenCalledWith('test-formatted-message');
    });
  });
});
