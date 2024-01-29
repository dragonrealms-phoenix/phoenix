import { createLogger } from '../logger/create-logger.js';

const logger = await createLogger('main:tls');

export { logger };
