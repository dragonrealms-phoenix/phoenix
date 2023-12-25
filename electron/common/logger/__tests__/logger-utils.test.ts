import type { Logger as ElectronLogger } from 'electron-log';
import { createLogger } from '../logger.utils';

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
    transports: {},
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
      it('should use main logger when window is undefined', () => {
        globalThis.window = undefined as any;

        const logger = createLogger('test');

        logger.info('message');

        expect(electronLogMain?.info).toHaveBeenCalledWith('message');
      });

      it('should set logger scope when scope is defined', () => {
        globalThis.window = undefined as any;

        createLogger('test');

        expect(electronLogMain?.scope).toHaveBeenCalledWith('test');
      });

      it('should not set logger scope when scope is undefined', () => {
        globalThis.window = undefined as any;

        createLogger();

        expect(electronLogMain?.scope).not.toHaveBeenCalled();
      });
    });

    describe('electron-log/renderer', () => {
      it('should use renderer logger when window is defined', () => {
        globalThis.window = {} as any;

        const logger = createLogger('test');

        logger.info('message');

        expect(electronLogRenderer?.info).toHaveBeenCalledWith('message');
      });

      it('should set logger scope when scope is defined', () => {
        globalThis.window = {} as any;

        createLogger('test');

        expect(electronLogRenderer?.scope).toHaveBeenCalledWith('test');
      });

      it('should not set logger scope when scope is undefined', () => {
        globalThis.window = {} as any;

        createLogger();

        expect(electronLogRenderer?.scope).not.toHaveBeenCalled();
      });
    });
  });

  describe('#initializeLogging', () => {
    const logger = {} as any;

    // initializeLogging(logger);

    // TODO
  });
});
