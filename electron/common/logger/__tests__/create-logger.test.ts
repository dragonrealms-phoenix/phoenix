import { faker } from '@faker-js/faker';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearElectronLoggerMockProps,
  mockElectronLogMain,
  mockElectronLogRenderer,
} from '../../__mocks__/electron-log.mock.js';
import { createLogger } from '../create-logger.js';
import type { Logger } from '../types.js';

describe('create-logger', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe('window is undefined', () => {
    let logger: Logger;

    beforeEach(async () => {
      (globalThis as any).window = undefined;
      logger = await createLogger(faker.lorem.slug());
      clearElectronLoggerMockProps(mockElectronLogMain);
    });

    it('uses main logger', async () => {
      logger.info('test');

      expect(mockElectronLogMain.info).toHaveBeenCalledWith('test');
    });

    it('does not use renderer logger', async () => {
      logger.info('test');

      expect(mockElectronLogRenderer.info).not.toHaveBeenCalled();
    });

    it('sets logger scope', async () => {
      const scope = faker.lorem.slug();

      await createLogger(scope);

      expect(mockElectronLogMain.scope).toHaveBeenCalledWith(scope);
    });

    it('does not set logger scope', async () => {
      await createLogger();

      expect(mockElectronLogMain.scope).not.toHaveBeenCalled();
    });
  });

  describe('window is defined', () => {
    let logger: Logger;

    beforeEach(async () => {
      (globalThis as any).window = {};
      logger = await createLogger(faker.lorem.slug());
      clearElectronLoggerMockProps(mockElectronLogMain);
      clearElectronLoggerMockProps(mockElectronLogRenderer);
    });

    it('uses renderer logger', async () => {
      logger.info('test');

      expect(mockElectronLogRenderer.info).toHaveBeenCalledWith('test');
    });

    it('does not use main logger', async () => {
      logger.info('test');

      expect(mockElectronLogMain.info).not.toHaveBeenCalled();
    });

    it('sets logger scope', async () => {
      const scope = faker.lorem.slug();

      await createLogger(scope);

      expect(mockElectronLogRenderer.scope).toHaveBeenCalledWith(scope);
    });

    it('does not set logger scope', async () => {
      await createLogger();

      expect(mockElectronLogRenderer.scope).not.toHaveBeenCalled();
    });
  });
});
