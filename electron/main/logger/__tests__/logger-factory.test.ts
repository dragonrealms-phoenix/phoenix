import { afterEach, describe, expect, it, vi } from 'vitest';
import { LogLevel } from '../../../common/logger/types.js';
import { getScopedLogger } from '../logger.factory.js';

const { mockLogger } = await vi.hoisted(async () => {
  const loggerMockModule = await import(
    '../../../common/logger/__mocks__/logger.mock.js'
  );

  const mockLogger = new loggerMockModule.LoggerMockImpl();

  return {
    mockLogger,
  };
});

vi.mock('../logger.js', () => {
  class MyLogger {
    constructor() {
      return mockLogger;
    }
  }

  return {
    LoggerImpl: MyLogger,
  };
});

vi.mock('electron', async () => {
  return {
    app: {
      getName: vi.fn().mockReturnValue('test-name'),
      getPath: vi.fn().mockReturnValue('test-path'),
    },
  };
});

describe('logger-factory', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe('#getScopedLogger', () => {
    it('enriches message with scope to default logger delegate', async () => {
      const logger = getScopedLogger('test-scope');

      logger.info('test', { message: 'test' });

      expect(mockLogger.log).toHaveBeenCalledWith({
        level: LogLevel.INFO,
        message: 'test',
        data: {
          message: 'test',
          scope: 'test-scope',
        },
      });
    });

    it('caches logger with same scopes', async () => {
      const logger1a = getScopedLogger('test-scope-1');
      const logger1b = getScopedLogger('test-scope-1');
      const logger2a = getScopedLogger('test-scope-2');

      expect(logger1a).toBe(logger1b);
      expect(logger1a).not.toBe(logger2a);
    });
  });
});
