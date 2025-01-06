import type { LogLevel } from '../types.js';

export const getLogLevel = (): LogLevel => {
  return (process.env.LOG_LEVEL || 'info') as LogLevel;
};
