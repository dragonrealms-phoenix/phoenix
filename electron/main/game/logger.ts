import { createLogger } from '../logger/create-logger.js';

const gameInstanceLogger = await createLogger('main:game:instance');
const gameParserLogger = await createLogger('main:game:parser');
const gameServiceLogger = await createLogger('main:game:service');
const gameSocketLogger = await createLogger('main:game:socket');

export {
  gameInstanceLogger,
  gameParserLogger,
  gameServiceLogger,
  gameSocketLogger,
};
