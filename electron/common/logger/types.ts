export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace',
}

export type LogData = Record<string, unknown>;

export type LogFunction = (message: string, data?: LogData) => void;

export interface Logger {
  error: LogFunction;
  warn: LogFunction;
  info: LogFunction;
  debug: LogFunction;
  trace: LogFunction;
}
