import { createLogger } from '../logger/create-logger.js';

const logger = createLogger({ scope: 'common:async' });

export { logger };
