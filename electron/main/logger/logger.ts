import { AbstractLogger } from '../../common/logger/abstract-logger.js';
import type {
  LogData,
  LogLevel,
  LogMessage,
  LogTransportConfig,
  LogTransporter,
} from '../../common/logger/types.js';
import { isLogLevelEnabled } from './logger.utils.js';

const DEFAULT_SCOPE = 'default';

const DEFAULT_TRANSPORTER: LogTransporter = {
  transport: (message: LogMessage): void => {
    console.log(message);
  },
};

/**
 * Originally, I used the `electron-log` module (https://github.com/megahertz/electron-log)
 * but at some point it stopped writing logs from renderer to a file.
 * Possibly related to https://github.com/megahertz/electron-log/issues/441.
 * After multiple attempts to fix it, I decided to implement my own logger.
 */
export class LoggerImpl extends AbstractLogger {
  private scope: string;

  private transports: Array<LogTransportConfig>;

  constructor(options: {
    scope?: string;
    transports?: Array<LogTransportConfig>;
  }) {
    super();

    this.scope = options.scope ?? DEFAULT_SCOPE;

    this.transports = options.transports ?? [
      {
        transporter: DEFAULT_TRANSPORTER,
      },
    ];
  }

  public override log(options: {
    level: LogLevel;
    message: string;
    data?: LogData;
  }): void {
    const { level, message, data } = options;

    if (!isLogLevelEnabled(level)) {
      return;
    }

    const logMessage: LogMessage = {
      level,
      message,
      scope: this.scope,
      timestamp: new Date(),
      ...data,
    };

    for (const { level, transporter } of this.transports) {
      try {
        if (!this.isTransportLogLevelSupported(level)) {
          continue;
        }
        transporter.transport(logMessage);
      } catch (error) {
        console.error('[LOGGER:TRANSPORT:ERROR]', error);
      }
    }
  }

  protected isTransportLogLevelSupported(level?: LogLevel): boolean {
    return !level || isLogLevelEnabled(level);
  }
}
