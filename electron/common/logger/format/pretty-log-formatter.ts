import { inspect } from 'node:util';
import type { ChalkInstance } from 'chalk';
import { Chalk } from 'chalk';
import moment from 'moment';
import type { LogData, LogFormatter, LogMessage } from '../types.js';
import { LogLevel } from '../types.js';
import { formatLogData } from './format-log-data.js';
import { maskLogData } from './mask-log-data.js';

export const prettyLogFormatter = (options: {
  colors: boolean;
}): LogFormatter => {
  const { colors } = options;

  const chalk = new Chalk({ level: colors ? 1 : 0 });

  const formatter: LogFormatter = (datas: Array<LogMessage>): string => {
    const logLines = datas.map((data) => {
      const formattedData = maskLogData(formatLogData(data)) as LogMessage;

      const { timestamp, level, scope, message, ...rest } = formattedData;

      const timeStr = formatTime({ chalk, timestamp });
      const levelStr = formatLevel({ chalk, level });
      const scopeStr = formatScope({ chalk, scope });
      const messageStr = formatMessage({ chalk, message });
      const restStr = formatObject({ data: rest, colors });

      // Because of how the colorized text is created or rendered,
      // whitespaces behave like in HTML: multiple spaces are collapsed to one.
      // To preserve whitespace, you must add the extra spaces to the string
      // that is passed to one of the chalk methods.

      return `${timeStr} ${levelStr} ${scopeStr} ${messageStr} ‣ ${restStr}`;
    });
    return logLines.join('\n') + '\n';
  };

  return formatter;
};

const formatTime = (options: {
  chalk: ChalkInstance;
  timestamp: Date;
}): string => {
  const { chalk, timestamp } = options;
  const pattern = 'YYYY-MM-DD HH:mm:ss.SSSZ';
  const color = chalk.gray;
  const result = color(`[${moment(timestamp).format(pattern)}]`);
  return result;
};

const formatLevel = (options: {
  chalk: ChalkInstance;
  level: LogLevel;
}): string => {
  const { chalk, level } = options;
  const color = getLogLevelColor({ chalk, level });
  const result = color(`[${level.toUpperCase()}]`.padEnd(8));
  return result;
};

const formatScope = (options: {
  chalk: ChalkInstance;
  scope: string;
}): string => {
  const { chalk, scope } = options;
  const color = chalk.blue;
  const result = color(`(${scope})`.padEnd(20));
  return result;
};

const formatMessage = (options: {
  chalk: ChalkInstance;
  message: string;
}): string => {
  const { chalk, message } = options;
  const color = chalk.reset;
  const result = color(message);
  return result;
};

const formatObject = (options: { data: LogData; colors: boolean }): string => {
  const { data, colors } = options;
  return inspect(data, {
    colors,
    depth: 5,
    compact: true,
    breakLength: 60,
  });
};

const getLogLevelColor = (options: {
  chalk: ChalkInstance;
  level: LogLevel;
}): ChalkInstance => {
  const { chalk, level } = options;

  switch (level) {
    case LogLevel.ERROR:
      return chalk.red;
    case LogLevel.WARN:
      return chalk.yellow;
    case LogLevel.INFO:
      return chalk.cyan;
    default:
      return chalk.reset;
  }
};
