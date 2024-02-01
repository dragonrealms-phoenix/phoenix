import type { LogLevel } from './types.js';

export const getLogLevel = (): LogLevel => {
  // eslint-disable-next-line no-restricted-globals -- process.env is allowed
  return (process.env.LOG_LEVEL || 'info') as LogLevel;
};
