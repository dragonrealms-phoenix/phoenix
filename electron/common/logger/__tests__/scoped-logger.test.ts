import { beforeEach, describe, expect, it } from 'vitest';
import type { LoggerMock } from '../__mocks__/logger.mock.js';
import { LoggerMockImpl } from '../__mocks__/logger.mock.js';
import { ScopedLoggerImpl } from '../scoped.logger.js';
import { LogLevel } from '../types.js';

describe('scoped-logger', () => {
  let mockLogger: LoggerMock;

  let scopedLogger: ScopedLoggerImpl;

  beforeEach(() => {
    mockLogger = new LoggerMockImpl();

    scopedLogger = new ScopedLoggerImpl({
      scope: 'test-scope-from-logger',
      delegate: mockLogger,
    });
  });

  describe('#log', () => {
    it('should log with the correct scope', () => {
      scopedLogger.log({
        level: LogLevel.INFO,
        message: 'test-message',
      });

      expect(mockLogger.log).toHaveBeenCalledWith({
        level: LogLevel.INFO,
        message: 'test-message',
        data: {
          scope: 'test-scope-from-logger',
        },
      });
    });

    it('should allow scope to be overwritten by data', () => {
      scopedLogger.log({
        level: LogLevel.INFO,
        message: 'test-message',
        data: {
          scope: 'test-scope-from-data',
          foo: 'bar',
        },
      });

      expect(mockLogger.log).toHaveBeenCalledWith({
        level: LogLevel.INFO,
        message: 'test-message',
        data: {
          scope: 'test-scope-from-data',
          foo: 'bar',
        },
      });
    });
  });

  describe('#debug', () => {
    it('should delegate to the underlying logger', () => {
      scopedLogger.debug('test-debug');

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.DEBUG,
          message: 'test-debug',
          data: {
            scope: 'test-scope-from-logger',
          },
        })
      );
    });
  });

  describe('#info', () => {
    it('should delegate to the underlying logger', () => {
      scopedLogger.info('test-info');

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.INFO,
          message: 'test-info',
          data: {
            scope: 'test-scope-from-logger',
          },
        })
      );
    });
  });

  describe('#warn', () => {
    it('should delegate to the underlying logger', () => {
      scopedLogger.warn('test-warn');

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.WARN,
          message: 'test-warn',
          data: {
            scope: 'test-scope-from-logger',
          },
        })
      );
    });
  });

  describe('#error', () => {
    it('should delegate to the underlying logger', () => {
      scopedLogger.error('test-error');

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.ERROR,
          message: 'test-error',
          data: {
            scope: 'test-scope-from-logger',
          },
        })
      );
    });
  });
});
