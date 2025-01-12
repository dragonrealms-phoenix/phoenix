import type { Maybe } from '../types.js';

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
 * Formats log messages into strings to be written to transporters.
 * Return `undefined` to skip logging the message.
 */
export interface LogFormatter {
  format(message: LogMessage): Maybe<string>;
}

/**
 * Transporters write formatted messages somewhere.
 * For example, to the console, a file, an api, or nowhere.
 * What the string looks like is up to the formatter.
 */
export interface LogTransporter {
  transport(message: string): void;
}

export interface LogTransportConfig {
  /**
   * Transports formatted log lines somewhere.
   * Could write them to a console, to a file, or ship to a remote system.
   */
  transporter: LogTransporter;
  /**
   * Formats log data objects into strings to write to the transporter.
   */
  formatter: LogFormatter;
  /**
   * By default, all messages are logged to every transporter for levels
   * that satisify the runtime log level. You can further restrict which
   * levels are logged to a specific transporter by setting this property.
   *
   * For example, if the runtime log level is 'INFO' but you only want to send
   * errors to this transporter, then set this config's level to 'ERROR'.
   */
  level?: LogLevel;
}

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
