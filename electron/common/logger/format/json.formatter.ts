import { inspect } from 'node:util';
import type { LogFormatter, LogMessage } from '../types.js';
import { formatLogData, maskLogData } from './format.utils.js';

export const jsonLogFormatterFactory = (options: {
  colors: boolean;
}): LogFormatter => {
  const { colors } = options;

  const formatter: LogFormatter = (logMessages: Array<LogMessage>): string => {
    const logLines = formatLogMessages({ colors, logMessages });
    return logLines.join('\n') + '\n';
  };

  return formatter;
};

const formatLogMessages = (options: {
  colors: boolean;
  logMessages: Array<LogMessage>;
}): Array<string> => {
  const { colors, logMessages } = options;

  return logMessages.map((logMessage) => {
    return formatLogMessage({ colors, logMessage });
  });
};

const formatLogMessage = (options: {
  colors: boolean;
  logMessage: LogMessage;
}): string => {
  const { colors, logMessage } = options;

  const formattedData = maskLogData(formatLogData(logMessage));

  return inspect(formattedData, {
    colors,
    depth: 5,
    compact: true,
    breakLength: Infinity,
  });
};
