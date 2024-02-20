import { createLogger } from '../logger/create-logger.js';

const gameInstanceLogger = createLogger('main:game:instance');
const gameParserLogger = createLogger('main:game:parser');
const gameServiceLogger = createLogger('main:game:service');
const gameSocketLogger = createLogger('main:game:socket');

export {
  gameInstanceLogger,
  gameParserLogger,
  gameServiceLogger,
  gameSocketLogger,
};
