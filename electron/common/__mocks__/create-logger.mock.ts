import { vi } from 'vitest';
import type { Logger } from '../logger/types.js';

type CreateLoggerModule = typeof import('../logger/create-logger.js');

const { mockCreateLogger } = vi.hoisted(() => {
  const logger: Logger = {
    error: vi.fn<Logger['error']>(),
    warn: vi.fn<Logger['warn']>(),
    info: vi.fn<Logger['info']>(),
    debug: vi.fn<Logger['debug']>(),
    trace: vi.fn<Logger['trace']>(),
  };

  const mockCreateLogger = vi
    .fn<CreateLoggerModule['createLogger']>()
    .mockReturnValue(logger);

  return { mockCreateLogger };
});

vi.mock('../logger/create-logger.js', async () => {
  return {
    createLogger: mockCreateLogger,
  };
});

export { mockCreateLogger };
