import { createLogger } from '../logger/create-logger.js';

const logger = await createLogger('main:electron-next');

export { logger };
