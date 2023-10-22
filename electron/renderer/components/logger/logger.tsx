import { FunctionComponent, createContext, useContext, useEffect } from 'react';
import { Logger } from '../../../common/logger/logger.types';
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
  createLogger: typeof createLogger;
}

const logger = createLogger('renderer');

const LoggerContext = createContext<LoggerContextValue>({
  logger,
  createLogger,
});
LoggerContext.displayName = 'LoggerContext'; // for dev tools

export const LoggerProvider: FunctionComponent<any> = ({ children }) => {
  useEffect(() => {
    // Once client-side, start monitoring unhandled exceptions on the window.
    startMonitoringUnhandledExceptions();
    return () => {
      stopMonitoringUnhandledExceptions();
    };
  }, []);

  return (
    <LoggerContext.Provider value={{ logger, createLogger }}>
      {children}
    </LoggerContext.Provider>
  );
};

export const useLogger = (scope?: string): LoggerContextValue => {
  const context = useContext(LoggerContext);
  if (scope) {
    return {
      ...context,
      logger: createLogger(scope),
    };
  }
  return context;
};
