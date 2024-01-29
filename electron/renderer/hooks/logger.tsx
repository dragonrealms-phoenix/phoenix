import { useContext, useEffect, useState } from 'react';
import { runInBackground } from '../../common/async/run-in-background.js';
import { createLogger } from '../../common/logger/create-logger.js';
import type { Logger } from '../../common/logger/types.js';
import { LoggerContext } from '../context/logger.jsx';

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
      runInBackground(async () => {
        setLogger(await createLogger(scope));
      });
    }
  }, [scope]);

  return logger;
};
