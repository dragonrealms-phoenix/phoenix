import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LoggerMock } from '../../../../common/logger/__mocks__/logger.mock.js';
import { LoggerMockImpl } from '../../../../common/logger/__mocks__/logger.mock.js';
import type { LogMessage } from '../../../../common/logger/types.js';
import { LogLevel } from '../../../../common/logger/types.js';
import { logHandler } from '../log.js';

vi.mock('../../../logger/logger.factory.ts');

describe('log', () => {
  let mockLogMessage: LogMessage;
  let mockLogger: LoggerMock;

  beforeEach(() => {
    mockLogMessage = {
      level: LogLevel.INFO,
      scope: 'test-scope',
      message: 'test-message',
      timestamp: new Date(),
      data: { foo: 'bar' },
    };

    mockLogger = new LoggerMockImpl();

    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#logHandler', async () => {
    it('logs a message', async () => {
      const handler = logHandler({
        logger: mockLogger,
      });

      handler([mockLogMessage]);

      expect(mockLogger.log).toHaveBeenCalledTimes(1);
      expect(mockLogger.log).toHaveBeenCalledWith(mockLogMessage);
    });
  });
});
