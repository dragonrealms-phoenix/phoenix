import type { Logger as ElectronLogger, Hook, LogMessage } from 'electron-log';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearElectronLoggerMockProps,
  electronLogMain,
} from '../__mocks__/electron-log.mock.js';
import { initializeLogging } from '../initialize-logging.js';

describe('initialize-logging', () => {
  // For these tests it doesn't matter which electron logger we use.
  // They both satisfy the same interface for the method we're testing.
  beforeEach(async () => {
    clearElectronLoggerMockProps(electronLogMain);
  });

  it('adds a hook to format log data', () => {
    expect(electronLogMain.hooks).toHaveLength(0);

    initializeLogging(electronLogMain as ElectronLogger);

    expect(electronLogMain.hooks).toHaveLength(1);

    const hook = electronLogMain.hooks![0] as Hook;

    const message: LogMessage = {
      date: new Date(),
      level: 'info',
      data: ['message', { password: 'secret' }],
    };

    const formattedMessage = hook(message);

    expect(formattedMessage).toEqual({
      date: expect.any(Date),
      level: 'info',
      data: ['message', { password: '***REDACTED***' }],
    });
  });

  it('adds an info log level to each transport when env var not set', () => {
    expect(electronLogMain.transports).toEqual({ console: {}, file: {} });

    initializeLogging(electronLogMain as ElectronLogger);

    expect(electronLogMain.transports).toEqual({
      console: { level: 'info' },
      file: { level: 'info' },
    });
  });

  it('adds a log level to each transport when env var set', () => {
    // eslint-disable-next-line no-restricted-globals -- process.env is allowed
    process.env.LOG_LEVEL = 'debug';

    expect(electronLogMain.transports).toEqual({ console: {}, file: {} });

    initializeLogging(electronLogMain as ElectronLogger);

    expect(electronLogMain.transports).toEqual({
      console: { level: 'debug' },
      file: { level: 'debug' },
    });
  });
});
