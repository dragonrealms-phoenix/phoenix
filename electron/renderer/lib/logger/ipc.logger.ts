import { AbstractLogger } from '../../../common/logger/abstract.logger.js';
import type { LogData, LogLevel } from '../../../common/logger/types.js';

export class IpcLoggerImpl extends AbstractLogger {
  public override log(options: {
    level: LogLevel;
    message: string;
    data?: LogData;
  }): void {
    const { level, message, data } = options;

    window.api.log({
      scope: 'renderer',
      level,
      message,
      timestamp: new Date(),
      ...data,
    });
  }
}
