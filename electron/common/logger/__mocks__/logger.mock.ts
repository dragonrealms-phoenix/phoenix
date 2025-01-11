import type { MockedFunction } from 'vitest';
import { vi } from 'vitest';
import { AbstractLogger } from '../abstract-logger.js';
import { type Logger } from '../types.js';

export interface LoggerMock extends Logger {
  error: MockedFunction<Logger['error']>;
  warn: MockedFunction<Logger['warn']>;
  info: MockedFunction<Logger['info']>;
  debug: MockedFunction<Logger['debug']>;
  log: MockedFunction<Logger['log']>;
}

export class LoggerMockImpl extends AbstractLogger implements LoggerMock {
  public override error = vi
    .fn<Logger['error']>()
    .mockImplementation((...args) => {
      super.error(...args);
    });

  public override warn = vi
    .fn<Logger['warn']>()
    .mockImplementation((...args) => {
      super.warn(...args);
    });

  public override info = vi
    .fn<Logger['info']>()
    .mockImplementation((...args) => {
      super.info(...args);
    });

  public override debug = vi
    .fn<Logger['debug']>()
    .mockImplementation((...args) => {
      super.debug(...args);
    });

  public override log = vi.fn();
}
