import { inspect } from 'node:util';
import type { LogMessage } from '../../../common/logger/types.js';
import type { LogFormatter } from '../types.js';
import { formatLogData, maskLogData } from './format.utils.js';

export class JsonLogFormatterImpl implements LogFormatter {
  private useColors: boolean;

  constructor(options?: { useColors?: boolean }) {
    this.useColors = options?.useColors ?? false;
  }

  public format(logMessage: LogMessage): string {
    const formattedData = maskLogData(formatLogData(logMessage));

    const jsonString = inspect(formattedData, {
      colors: this.useColors,
      depth: 5,
      compact: true,
      breakLength: Infinity,
    });

    return `${jsonString}\n`;
  }
}
