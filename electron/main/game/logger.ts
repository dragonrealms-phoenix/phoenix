import { getScopedLogger } from '../logger/logger.factory.js';

const gameInstanceLogger = getScopedLogger('main:game:instance');
const gameParserLogger = getScopedLogger('main:game:parser');
const gameServiceLogger = getScopedLogger('main:game:service');
const gameSocketLogger = getScopedLogger('main:game:socket');

export {
  gameInstanceLogger,
  gameParserLogger,
  gameServiceLogger,
  gameSocketLogger,
};
