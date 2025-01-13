import { vi } from 'vitest';
import { LoggerMockImpl } from '../../../common/logger/__mocks__/logger.mock.js';

//
// To support auto-mocking, this file's name must match exactly
// the module that test code would import. Otherwise, the test code
// requires manual mocking, which would be very cumbersome since nearly
// all of the main package's modules import a logger.
// https://vitest.dev/guide/mocking#automocking-algorithm
//

const mockLogger = new LoggerMockImpl();

export const getScopedLogger = vi.fn().mockReturnValue(mockLogger);

// Note to self, this is how I was manually mocking the logger before.
// Each test file had to do this, yikes!
/*
  const { mockLogger } = await vi.hoisted(async () => {
    const LoggerMockModule = await import(
      '../../../common/logger/__mocks__/logger.mock.js'
    );

    const { LoggerMockImpl } = LoggerMockModule;

    const mockLogger = new LoggerMockImpl();

    return {
      mockLogger,
    };
  });

  vi.mock('../logger.ts', () => {
    return {
      logger: mockLogger,
    };
  });
*/
