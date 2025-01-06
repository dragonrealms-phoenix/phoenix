import type { Writable } from 'node:stream';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace',
}

export type LogData = Record<string, unknown> & { scope?: string };

export type LogMessage = LogData & {
  scope: string;
  level: LogLevel;
  message: string;
  timestamp: Date;
};

/**
 * Because log messages are asynchronously written to the transports,
 * your formatter may receive one or more log data objects at a time.
 * Format one or more log data objects into a single string to write.
 * Typically, you want to append a newline between each log entry.
 */
export type LogFormatter = (messages: Array<LogMessage>) => string;

/**
 * Transports are writable streams. They write messages somewhere,
 * whether that's to the console, to a file, or other system.
 */
export type LogTransport = Writable;

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
