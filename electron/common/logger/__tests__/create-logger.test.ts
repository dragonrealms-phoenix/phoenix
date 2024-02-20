import { faker } from '@faker-js/faker';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearElectronLoggerMockProps,
  mockElectronLogMain,
  mockElectronLogRenderer,
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

  describe('default logger option', () => {
    beforeEach(() => {
      clearElectronLoggerMockProps(mockElectronLogMain);
      clearElectronLoggerMockProps(mockElectronLogRenderer);
    });

    it('uses injected logger', async () => {
      const scope = faker.lorem.slug();

      const logger = createLogger({
        scope,
      });

      logger.info('test');

      expect(mockElectronLogMain.info).toHaveBeenCalledWith('test');
      expect(mockElectronLogRenderer.info).not.toHaveBeenCalled();
    });

    it('sets logger scope', async () => {
      const scope = faker.lorem.slug();

      createLogger({
        scope,
      });

      expect(mockElectronLogMain.scope).toHaveBeenCalledWith(scope);
      expect(mockElectronLogRenderer.scope).not.toHaveBeenCalled();
    });

    it('does not set logger scope', async () => {
      createLogger();

      expect(mockElectronLogMain.scope).not.toHaveBeenCalled();
      expect(mockElectronLogRenderer.scope).not.toHaveBeenCalled();
    });
  });

  describe('inject logger option', () => {
    beforeEach(() => {
      clearElectronLoggerMockProps(mockElectronLogMain);
      clearElectronLoggerMockProps(mockElectronLogRenderer);
    });

    it('uses injected logger', async () => {
      const scope = faker.lorem.slug();

      const logger = createLogger({
        scope,
        logger: mockElectronLogRenderer,
      });

      logger.info('test');

      expect(mockElectronLogRenderer.info).toHaveBeenCalledWith('test');
      expect(mockElectronLogMain.info).not.toHaveBeenCalled();
    });

    it('sets logger scope', async () => {
      const scope = faker.lorem.slug();

      createLogger({
        scope,
        logger: mockElectronLogRenderer,
      });

      expect(mockElectronLogRenderer.scope).toHaveBeenCalledWith(scope);
      expect(mockElectronLogMain.scope).not.toHaveBeenCalled();
    });

    it('does not set logger scope', async () => {
      createLogger({
        logger: mockElectronLogRenderer,
      });

      expect(mockElectronLogRenderer.scope).not.toHaveBeenCalled();
      expect(mockElectronLogMain.scope).not.toHaveBeenCalled();
    });
  });
});
