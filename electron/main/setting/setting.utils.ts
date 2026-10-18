import readline from 'node:readline';
import type fs from 'fs-extra';
import type { Maybe } from '../../common/types.js';
import { logger } from './logger.js';

/**
 * Reads a stream line by line and parses each line.
 * Returns an array of parsed values.
 * Closes the stream when done or if an error occurs.
 */
export const parseLines = async <T>(options: {
  readStream: fs.ReadStream;
  parse: (line: string) => Maybe<T>;
}): Promise<Array<T>> => {
  const { readStream, parse } = options;

  return new Promise<Array<T>>((resolve, reject) => {
    const parsedLines = new Array<T>();

    const lineReader = readline.createInterface({
      input: readStream,
      crlfDelay: Infinity,
    });

    lineReader.on('line', (line) => {
      const parsedLine = parse(line);

      logger.trace('parsed line', {
        line,
        parsedLine,
      });

      if (parsedLine) {
        parsedLines.push(parsedLine);
      }
    });

    lineReader.once('close', () => {
      readStream.close();
      resolve(parsedLines);
    });

    lineReader.once('error', (error) => {
      readStream.close();
      reject(error);
    });
  });
};
