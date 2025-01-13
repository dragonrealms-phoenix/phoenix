import { app } from 'electron';
import { ScopedLoggerImpl } from '../../common/logger/scoped.logger.js';
import type { Logger } from '../../common/logger/types.js';
import { JsonLogFormatterImpl } from './format/json.formatter.js';
import { PrettyLogFormatterImpl } from './format/pretty.formatter.js';
import { LoggerImpl } from './logger.js';
import { ConsoleLogTransporterImpl } from './transport/console.transporter.js';
import { FileLogTransporterImpl } from './transport/file.transporter.js';
import type { LogTransportConfig } from './types.js';

let defaultLogger: Logger;

const scopedLoggers: Record<string, Logger> = {};

/**
 * Creates and caches a logger with the specific scope for all messages.
 * You can overwrite the scope on a per-message basis by passing `scope`
 * to the `data` argument of any of the log functions.
 */
export const getScopedLogger = (scope: string): Logger => {
  const cachedLogger = scopedLoggers[scope];

  if (cachedLogger) {
    return cachedLogger;
  }

  if (!defaultLogger) {
    defaultLogger = createDefaultLogger();
  }

  const scopedLogger = new ScopedLoggerImpl({
    scope,
    delegate: defaultLogger,
  });

  scopedLoggers[scope] = scopedLogger;

  return scopedLogger;
};

const createDefaultLogger = (): Logger => {
  return new LoggerImpl({
    transports: [createConsoleTransportConfig(), createFileTransportConfig()],
  });
};

const createConsoleTransportConfig = (): LogTransportConfig => {
  return {
    transporter: new ConsoleLogTransporterImpl({
      formatter: new PrettyLogFormatterImpl({ useColors: true }),
    }),
  };
};

const createFileTransportConfig = (): LogTransportConfig => {
  const logsPath = app.getPath('logs');

  return {
    transporter: new FileLogTransporterImpl({
      filePath: logsPath,
      append: true,
      encoding: 'utf8',
      formatter: new JsonLogFormatterImpl(),
    }),
  };
};
