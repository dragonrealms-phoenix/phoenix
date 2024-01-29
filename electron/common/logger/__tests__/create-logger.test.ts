import { faker } from '@faker-js/faker';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearElectronLoggerMockProps,
  electronLogMain,
  electronLogRenderer,
} from '../__mocks__/electron-log.mock.js';
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
      clearElectronLoggerMockProps(electronLogMain);
    });

    it('uses main logger', async () => {
      logger.info('test');

      expect(electronLogMain.info).toHaveBeenCalledWith('test');
    });

    it('does not use renderer logger', async () => {
      logger.info('test');

      expect(electronLogRenderer.info).not.toHaveBeenCalled();
    });

    it('sets logger scope', async () => {
      const scope = faker.lorem.slug();

      await createLogger(scope);

      expect(electronLogMain.scope).toHaveBeenCalledWith(scope);
    });

    it('does not set logger scope', async () => {
      await createLogger();

      expect(electronLogMain.scope).not.toHaveBeenCalled();
    });
  });

  describe('window is defined', () => {
    let logger: Logger;

    beforeEach(async () => {
      (globalThis as any).window = {};
      logger = await createLogger(faker.lorem.slug());
      clearElectronLoggerMockProps(electronLogMain);
      clearElectronLoggerMockProps(electronLogRenderer);
    });

    it('uses renderer logger', async () => {
      logger.info('test');

      expect(electronLogRenderer.info).toHaveBeenCalledWith('test');
    });

    it('does not use main logger', async () => {
      logger.info('test');

      expect(electronLogMain.info).not.toHaveBeenCalled();
    });

    it('sets logger scope', async () => {
      const scope = faker.lorem.slug();

      await createLogger(scope);

      expect(electronLogRenderer.scope).toHaveBeenCalledWith(scope);
    });

    it('does not set logger scope', async () => {
      await createLogger();

      expect(electronLogRenderer.scope).not.toHaveBeenCalled();
    });
  });
});
