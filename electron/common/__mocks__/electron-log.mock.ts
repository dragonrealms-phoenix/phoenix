import type {
  Logger as ElectronLogger,
  MainLogger as ElectronMainLogger,
  RendererLogger as ElectronRendererLogger,
} from 'electron-log';
import { vi } from 'vitest';
import type { DeepPartial } from '../types.js';

const { mockElectronLogMain, mockElectronLogRenderer } = vi.hoisted(() => {
  const createMockLogger = (): Partial<ElectronLogger> => {
    const logger = {
      // The scope method returns a new logger. For testing purposes,
      // we want to return our same mock instance so that we can
      // verify what functions were called and all that jazz.
      // Due to the chicken-or-the-egg situation, we can't reference
      // the variable being created now, so we have to use a function.
      // When the scope function is called it will call the scopeReturnValue
      // function which will return the desired mock.
      scope: vi.fn().mockImplementation(() => logger),
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
      trace: vi.fn(),
      addLevel: vi.fn(),
      levels: ['debug', 'info', 'warn', 'error'],
      hooks: [],
      transports: {
        console: {},
        file: {},
      },
      // main logger only
      initialize: vi.fn(),
      // renderer logger only
      errorHandler: {
        startCatching: vi.fn(),
        stopCatching: vi.fn(),
      },
    } as unknown as Partial<ElectronLogger>;
    return logger;
  };

  return {
    mockElectronLogMain: createMockLogger() as ElectronMainLogger,
    mockElectronLogRenderer: createMockLogger() as ElectronRendererLogger,
  };
});

vi.mock('electron-log', () => {
  return {
    default: mockElectronLogMain,
    ...mockElectronLogMain,
  };
});

vi.mock('electron-log/main.js', () => {
  return {
    default: mockElectronLogMain,
    ...mockElectronLogMain,
  };
});

vi.mock('electron-log/renderer.js', () => {
  return {
    default: mockElectronLogRenderer,
    ...mockElectronLogRenderer,
  };
});

const clearMockProps = (obj: Record<string, any>): void => {
  Object.keys(obj).forEach((key) => {
    const mock = obj[key];
    if (typeof mock.mockClear === 'function') {
      mock.mockClear();
    }
  });
};

export const clearElectronLoggerMockProps = (
  logger: DeepPartial<ElectronLogger>
): void => {
  // Reinitialize the mock to reset its hooks and transports properties.
  // Otherwise the previous test's hooks and transports will still be there.
  clearMockProps(logger);
  logger.levels = ['debug', 'info', 'warn', 'error'];
  logger.hooks = [];
  logger.transports = {
    console: {},
    file: {},
  };
};

export { mockElectronLogMain, mockElectronLogRenderer };
