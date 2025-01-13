import type { LogLevel, LogMessage } from '../../common/logger/types.js';

/**
 * Formats log messages into strings to be written to transporters.
 */
export interface LogFormatter {
  format(message: LogMessage): string;
}

/**
 * Transporters write log messages somewhere.
 * For example, to a console, a file, an api, or nowhere.
 */
export interface LogTransporter {
  transport(message: LogMessage): void;
}

export interface LogTransportConfig {
  /**
   * Transports log messages somewhere.
   * For example, to the console, a file, an api, or nowhere.
   */
  transporter: LogTransporter;
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
