import fs from 'fs-extra';
import type { LogFormatter } from '../types.js';
import { WritableLogTransporterImpl } from './writable.transporter.js';

/**
 * Transports logs to a text file.
 */
export class FileLogTransporterImpl extends WritableLogTransporterImpl {
  constructor(options: {
    /**
     * Path where to write the logs.
     */
    filePath: string;
    /**
     * If true, the log messages will be appended to the file.
     * If false, the file will be overwritten.
     * Default is true.
     */
    append?: boolean;
    /**
     * The text encoding to use when writing the file.
     * Default is 'utf8'.
     */
    encoding?: BufferEncoding;
    /**
     * Optional to format the log messages before writing them.
     */
    formatter?: LogFormatter;
  }) {
    super({
      writable: fs.createWriteStream(options.filePath, {
        flags: options.append ? 'a' : 'w',
        encoding: options.encoding ?? 'utf8',
      }),
      ...options,
    });
  }
}
