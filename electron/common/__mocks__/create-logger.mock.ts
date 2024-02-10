import { vi } from 'vitest';
import type { Logger } from '../logger/types.js';

type CreateLoggerModule = typeof import('../logger/create-logger.js');

const { mockCreateLogger } = vi.hoisted(() => {
  const logger: Logger = {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
  };

  const mockCreateLogger: CreateLoggerModule['createLogger'] = vi
    .fn()
    .mockReturnValue(logger);

  return { mockCreateLogger };
});

vi.mock('../logger/create-logger.js', async (importOriginal) => {
  const originalModule = await importOriginal<CreateLoggerModule>();
  return {
    ...originalModule,
    createLogger: mockCreateLogger,
  };
});

export { mockCreateLogger };
