import type { ReactNode } from 'react';
import { createContext, useContext, useEffect } from 'react';
import type { Logger } from '../../../common/logger/logger.types';
import {
  createLogger,
  startMonitoringUnhandledExceptions,
  stopMonitoringUnhandledExceptions,
} from '../../lib/logger';

/**
 * React context for accessing a logger.
 */
interface LoggerContextValue {
  logger: Logger;
}

const logger = createLogger('renderer');

const LoggerContext = createContext<LoggerContextValue>({
  logger,
});

interface LoggerProviderProps {
  children: ReactNode;
}

const LoggerProvider: React.FC<LoggerProviderProps> = (
  props: LoggerProviderProps
) => {
  const { children } = props;

  useEffect(() => {
    // Once client-side, start monitoring unhandled exceptions on the window.
    startMonitoringUnhandledExceptions();
    return () => {
      stopMonitoringUnhandledExceptions();
    };
  }, []);

  return (
    <LoggerContext.Provider value={{ logger }}>
      {children}
    </LoggerContext.Provider>
  );
};

const scopedLoggers: Record<string, Logger> = {};

const useLogger = (scope?: string): LoggerContextValue => {
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

export { LoggerProvider, useLogger };
