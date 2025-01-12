import type { LogMessage } from '../../common/logger/types.js';

/**
 * Formats log messages into strings to be written to transporters.
 */
export interface LogFormatter {
  format(message: LogMessage): string;
}
