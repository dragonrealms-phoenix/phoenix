export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export type LogData = Record<string, unknown>;

export type LogFunction = (message: string, data?: LogData) => void;

export interface Logger {
  debug: LogFunction;
  info: LogFunction;
  warn: LogFunction;
  error: LogFunction;
}
