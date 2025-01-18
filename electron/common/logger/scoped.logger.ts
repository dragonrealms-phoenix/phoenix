import { AbstractLogger } from './abstract.logger.js';
import type { LogData, LogLevel, Logger } from './types.js';

/**
 * Decorates a logger to set the same scope for all log messages.
 * You can continue to customize the scope on a per-message basis
 * by setting the `scope` property in the `data` argument.
 */
export class ScopedLoggerImpl extends AbstractLogger {
  private scope: string;
  private delegate: Logger;

  constructor(options: { scope: string; delegate: Logger }) {
    super();
    this.scope = options.scope;
    this.delegate = options.delegate;
  }

  public override log(options: {
    level: LogLevel;
    message: string;
    data?: LogData;
  }): void {
    const { level, message, data } = options;

    this.delegate.log({
      level,
      message,
      data: {
        scope: this.scope,
        ...data,
      },
    });
  }
}
