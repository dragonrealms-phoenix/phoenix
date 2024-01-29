import { createLogger } from '../logger/create-logger.js';

const logger = await createLogger('common:async');

export { logger };
