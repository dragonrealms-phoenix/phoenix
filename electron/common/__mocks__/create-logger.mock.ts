import { vi } from 'vitest';
import type { Logger } from '../logger/types.js';
import type { DeepPartial } from '../types.js';

type CreateLoggerModule = typeof import('../logger/create-logger.js');

const { mockCreateLogger } = vi.hoisted(() => {
  const logger: Logger = {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
  };

  const mockCreateLogger = vi
    .fn<
      DeepPartial<Parameters<CreateLoggerModule['createLogger']>>,
      ReturnType<CreateLoggerModule['createLogger']>
    >()
    .mockReturnValue(logger);

  return { mockCreateLogger };
});

vi.mock('../logger/create-logger.js', async () => {
  return {
    createLogger: mockCreateLogger,
  };
});

export { mockCreateLogger };
