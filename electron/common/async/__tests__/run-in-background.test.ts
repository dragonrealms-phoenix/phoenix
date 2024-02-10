import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { mockCreateLogger } from '../../__mocks__/create-logger.mock.js';
import type { Logger } from '../../logger/types.js';
import { runInBackground } from '../run-in-background.js';

describe('run-in-background', () => {
  let logger: Logger;

  beforeAll(async () => {
    logger = await mockCreateLogger('test');
  });

  beforeEach(() => {
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
