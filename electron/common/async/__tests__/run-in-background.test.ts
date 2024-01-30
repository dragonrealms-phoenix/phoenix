import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createLogger } from '../../logger/create-logger.js';
import type { Logger } from '../../logger/types.js';
import { runInBackground } from '../run-in-background.js';

type CreateLoggerModule = typeof import('../../logger/create-logger.js');

vi.mock('../../logger/create-logger.js', async (importOriginal) => {
  const originalModule = await importOriginal<CreateLoggerModule>();
  const logger: Logger = {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
  };
  return {
    ...originalModule,
    createLogger: vi.fn().mockReturnValue(logger),
  };
});

describe('run-in-background', () => {
  let logger: Logger;

  beforeEach(async () => {
    logger = await createLogger('test');
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('does not log error when async callback resolves', async () => {
    runInBackground(async () => {});

    await vi.runAllTimersAsync();

    expect(logger.error).not.toHaveBeenCalled();
  });

  it('logs error when async callback rejects', async () => {
    runInBackground(async () => {
      throw new Error('test');
    });

    await vi.runAllTimersAsync();

    expect(logger.error).toHaveBeenCalledWith(
      'unhandled promise exception: test',
      {
        error: new Error('test'),
      }
    );
  });

  it('logs error when sync callback throws', async () => {
    runInBackground(() => {
      throw new Error('test');
    });

    await vi.runAllTimersAsync();

    expect(logger.error).toHaveBeenCalledWith(
      'unhandled promise exception: test',
      {
        error: new Error('test'),
      }
    );
  });
});
