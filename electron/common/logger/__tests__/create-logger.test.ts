import { faker } from '@faker-js/faker';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearElectronLoggerMockProps,
  mockElectronLogMain,
} from '../../__mocks__/electron-log.mock.js';
import { createLogger } from '../create-logger.js';

describe('create-logger', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  beforeEach(() => {
    clearElectronLoggerMockProps(mockElectronLogMain);
  });

  it('uses injected logger', async () => {
    const scope = faker.lorem.slug();

    const logger = createLogger({
      scope,
      logger: mockElectronLogMain,
    });

    logger.info('test');

    expect(mockElectronLogMain.info).toHaveBeenCalledWith('test');
  });

  it('sets logger scope', async () => {
    const scope = faker.lorem.slug();

    createLogger({
      scope,
      logger: mockElectronLogMain,
    });

    expect(mockElectronLogMain.scope).toHaveBeenCalledWith(scope);
  });

  it('does not set logger scope', async () => {
    createLogger({
      logger: mockElectronLogMain,
    });

    expect(mockElectronLogMain.scope).not.toHaveBeenCalled();
  });
});
