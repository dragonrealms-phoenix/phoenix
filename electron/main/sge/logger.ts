import { createLogger } from '../logger/create-logger.js';

const logger = await createLogger('main:sge');

export { logger };