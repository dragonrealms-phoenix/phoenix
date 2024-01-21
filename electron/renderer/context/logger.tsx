import type { ReactNode } from 'react';
import { createContext, useEffect } from 'react';
import type { Logger } from '../../common/logger';
import { createLogger } from '../../common/logger';
import {
  startMonitoringUnhandledExceptions,
  stopMonitoringUnhandledExceptions,
} from '../lib/logger';

const defaultLogger = createLogger('renderer');

/**
 * React context for accessing a logger.
 */
export interface LoggerContextValue {
  logger: Logger;
}

export const LoggerContext = createContext<LoggerContextValue>({
  logger: defaultLogger,
});

export interface LoggerProviderProps {
  /**
   * Logger to provide. If not provided, the default logger will be used.
   */
  logger?: Logger;
  /**
   * Nested components.
   */
  children?: ReactNode;
}

export const LoggerProvider: React.FC<LoggerProviderProps> = (
  props: LoggerProviderProps
) => {
  const { children, logger = defaultLogger } = props;

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
