import type { Logger as ElectronLogger, Hook, LogMessage } from 'electron-log';
import { createLogger, initializeLogging } from '../logger.utils';

let electronLogMain: Partial<ElectronLogger> | undefined;
let electronLogRenderer: Partial<ElectronLogger> | undefined;

const createMockLogger = (options: {
  scopeReturnValue: () => Partial<ElectronLogger>;
}): Partial<ElectronLogger> => {
  return {
    // The scope method returns a new logger. For testing purposes,
    // we want to return our same mock instance so that we can
    // verify what functions were called and all that jazz.
    // Due to the chicken-or-the-egg situation, we can't reference
    // the variable being created now, so we have to use a function.
    // When the scope function is called it will call the scopeReturnValue
    // function which will return the desired mock.
    scope: jest.fn().mockImplementation(options.scopeReturnValue),
    info: jest.fn(),
    hooks: [],
    transports: {
      console: {},
      file: {},
    },
  } as unknown as Partial<ElectronLogger>;
};

jest.mock('electron-log/main', () => {
  electronLogMain = createMockLogger({
    // See scope comments above. By the time this function is called
    // then the electronLogMain variable will be defined.
    scopeReturnValue: () => electronLogMain!,
  });
  return electronLogMain;
});

jest.mock('electron-log/renderer', () => {
  electronLogRenderer = createMockLogger({
    // See scope comments above. By the time this function is called
    // then the electronLogRenderer variable will be defined.
    scopeReturnValue: () => electronLogRenderer!,
  });
  return electronLogRenderer;
});

describe('logger-utils', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('#createLogger', () => {
    describe('electron-log/main', () => {
      beforeEach(() => {
        globalThis.window = undefined as any;
      });

      it('should use main logger when window is undefined', () => {
        const logger = createLogger('test');

        logger.info('message');

        expect(electronLogMain?.info).toHaveBeenCalledWith('message');
      });

      it('should set logger scope when scope is defined', () => {
        createLogger('test');

        expect(electronLogMain?.scope).toHaveBeenCalledWith('test');
      });

      it('should not set logger scope when scope is undefined', () => {
        createLogger();

        expect(electronLogMain?.scope).not.toHaveBeenCalled();
      });
    });

    describe('electron-log/renderer', () => {
      beforeEach(() => {
        globalThis.window = {} as any;
      });

      it('should use renderer logger when window is defined', () => {
        const logger = createLogger('test');

        logger.info('message');

        expect(electronLogRenderer?.info).toHaveBeenCalledWith('message');
      });

      it('should set logger scope when scope is defined', () => {
        createLogger('test');

        expect(electronLogRenderer?.scope).toHaveBeenCalledWith('test');
      });

      it('should not set logger scope when scope is undefined', () => {
        createLogger();

        expect(electronLogRenderer?.scope).not.toHaveBeenCalled();
      });
    });
  });

  describe('#initializeLogging', () => {
    beforeEach(() => {
      // Reinitialize the mock to reset its hooks and transports properties.
      // Otherwise the previous test's hooks and transports will still be there.
      // It doesn't matter whether we use the main or renderer logger,
      // they both satisfy the same interface for the method we're testing.
      electronLogMain = createMockLogger({
        scopeReturnValue: () => electronLogMain!,
      });
    });

    it('should add a hook to format log data', () => {
      expect(electronLogMain?.hooks).toHaveLength(0);

      initializeLogging(electronLogMain as ElectronLogger);

      expect(electronLogMain?.hooks).toHaveLength(1);

      const hook = electronLogMain?.hooks![0] as Hook;

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

    it('should add a info log level to each transport when env var not set', () => {
      expect(electronLogMain?.transports).toEqual({ console: {}, file: {} });

      initializeLogging(electronLogMain as ElectronLogger);

      expect(electronLogMain?.transports).toEqual({
        console: { level: 'info' },
        file: { level: 'info' },
      });
    });

    it('should add a log level to each transport when env var set', () => {
      // eslint-disable-next-line no-restricted-globals -- process.env is allowed
      process.env.LOG_LEVEL = 'debug';

      expect(electronLogMain?.transports).toEqual({ console: {}, file: {} });

      initializeLogging(electronLogMain as ElectronLogger);

      expect(electronLogMain?.transports).toEqual({
        console: { level: 'debug' },
        file: { level: 'debug' },
      });
    });
  });
});
