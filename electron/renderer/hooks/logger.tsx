import { useContext, useEffect, useState } from 'react';
import type { Logger } from '../../common/logger/types.js';
import { LoggerContext } from '../context/logger.jsx';
import { getScopedLogger } from '../lib/logger/logger.factory.js';

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
      setLogger(getScopedLogger(scope));
    } else {
      setLogger(context.logger);
    }
  }, [scope, context.logger]);

  return logger;
};
