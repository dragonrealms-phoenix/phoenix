import type { LogMessage } from '../../../common/logger/types.js';
import { LogLevel } from '../../../common/logger/types.js';
import type { LogFormatter, LogTransporter } from '../types.js';

/**
 * Transports logs to the console.
 */
export class ConsoleLogTransporterImpl implements LogTransporter {
  private formatter?: LogFormatter;

  constructor(options?: { formatter?: LogFormatter }) {
    this.formatter = options?.formatter;
  }

  public transport(message: LogMessage): void {
    const formattedMessage = this.formatter?.format(message) ?? message;

    switch (message.level) {
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.DEBUG:
      case LogLevel.TRACE:
        console.debug(formattedMessage);
        break;
      default:
        console.log(formattedMessage);
    }
  }
}
