import { useContext, useEffect, useState } from 'react';
import type { Logger } from '../../common/logger/types.js';
import { LoggerContext } from '../context/logger.jsx';
import { createLogger } from '../lib/logger/create-logger.js';

/**
 * To use this hook, the component must be inside a `LoggerProvider` hierarchy.
 *
 * Usage:
 * ```
 * const logger = useLogger();
 * const logger = useLogger('my-component');
 * ```
 */
export const useLogger = (scope?: string): Logger => {
  const context = useContext(LoggerContext);
  const [logger, setLogger] = useState<Logger>(context.logger);

  useEffect(() => {
    if (scope) {
      setLogger(createLogger(scope));
    } else {
      setLogger(context.logger);
    }
  }, [scope, context.logger]);

  return logger;
};
