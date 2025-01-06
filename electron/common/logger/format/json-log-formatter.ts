import { inspect } from 'node:util';
import type { LogFormatter, LogMessage } from '../types.js';
import { formatLogData } from './format-log-data.js';
import { maskLogData } from './mask-log-data.js';

export const jsonLogFormatter = (options: {
  colors: boolean;
}): LogFormatter => {
  const { colors } = options;

  const formatter: LogFormatter = (datas: Array<LogMessage>): string => {
    const logLines = datas.map((data) => {
      const formattedData = maskLogData(formatLogData(data)) as LogMessage;

      return inspect(formattedData, {
        colors,
        depth: 5,
        compact: true,
        breakLength: Infinity,
      });
    });
    return logLines.join('\n') + '\n';
  };

  return formatter;
};
