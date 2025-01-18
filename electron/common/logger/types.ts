/**
 * Originally, I used the `electron-log` module (https://github.com/megahertz/electron-log)
 * but at some point it stopped writing logs from renderer to a file.
 * Possibly related to https://github.com/megahertz/electron-log/issues/441.
 * After multiple attempts to fix it, I decided to implement my own logger.
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace',
}

export type LogData = Record<string, any> & { scope?: string };

export type LogMessage = LogData & {
  scope: string;
  level: LogLevel;
  message: string;
  timestamp: Date;
};

/**
 * Shape of a logger function that always logs to a specific level.
 */
export type LogLevelFunction = (message: string, data?: LogData) => void;

/**
 * Shape of a logger function that can log to an arbitrary level.
 */
export type LogFunction = (options: {
  level: LogLevel;
  message: string;
  data?: LogData;
}) => void;

export interface Logger {
  error: LogLevelFunction;
  warn: LogLevelFunction;
  info: LogLevelFunction;
  debug: LogLevelFunction;
  trace: LogLevelFunction;
  log: LogFunction;
}
