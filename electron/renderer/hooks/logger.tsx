import { useContext } from 'react';
import type { Logger } from '../../common/logger';
import { createLogger } from '../../common/logger';
import { LoggerContext, type LoggerContextValue } from '../context/logger';

const scopedLoggers: Record<string, Logger> = {};

/**
 * To use this hook, the component must be wrapped in a `LoggerProvider`
 * somewhere in the parent hierarchy.
 */
export const useLogger = (scope?: string): LoggerContextValue => {
  const context = useContext(LoggerContext);
  if (scope) {
    if (!scopedLoggers[scope]) {
      scopedLoggers[scope] = createLogger(scope);
    }
    return {
      ...context,
      logger: scopedLoggers[scope],
    };
  }
  return context;
};
