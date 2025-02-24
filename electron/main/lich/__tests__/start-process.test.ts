import type { ChildProcess } from 'node:child_process';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GameCode } from '../../../common/game/types.js';
import { PreferenceKey } from '../../preference/types.js';
import { startLichProcess } from '../start-process.js';

const { mockPreferenceService, mockSpawn } = await vi.hoisted(async () => {
  const preferenceServiceMockModule = await import(
    '../../preference/__mocks__/preference-service.mock.js'
  );

  const mockPreferenceService =
    new preferenceServiceMockModule.PreferenceServiceMockImpl();

  return {
    mockPreferenceService,
    mockSpawn: vi.fn(),
  };
});

vi.mock('node:child_process', () => ({
  spawn: mockSpawn,
}));

vi.mock('../../preference/preference.instance.js', () => {
  return {
    Preferences: mockPreferenceService,
  };
});

vi.mock('../../logger/logger.factory.ts');

describe('start-process', () => {
  let mockChildProcess: Partial<ChildProcess>;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    mockChildProcess = {
      pid: 1234,
      once: vi.fn(),
    };

    mockSpawn.mockReturnValue(mockChildProcess);

    mockPreferenceService.get.mockImplementation((key) => {
      switch (key) {
        case PreferenceKey.LICH_RUBY_PATH:
          return '/path/to/ruby';
        case PreferenceKey.LICH_PATH:
          return '/path/to/lich.rb';
        case PreferenceKey.LICH_HOST:
          return 'localhost';
        case PreferenceKey.LICH_PORT:
          return 4242;
        case PreferenceKey.LICH_START_WAIT:
          return 0;
      }
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#startLichProcess', () => {
    it('should start the process for dragonrealms prime', async () => {
      const result = await startLichProcess({
        gameCode: GameCode.PRIME,
      });

      expect(mockSpawn).toHaveBeenCalledWith('/path/to/ruby', [
        '/path/to/lich.rb',
        '--dragonrealms',
        '--genie',
      ]);

      expect(result).toEqual({
        pid: mockChildProcess.pid,
        host: 'localhost',
        port: 4242,
      });
    });

    it('should start the process for dragonrealms platinum', async () => {
      const result = await startLichProcess({
        gameCode: GameCode.PLATINUM,
      });

      expect(mockSpawn).toHaveBeenCalledWith('/path/to/ruby', [
        '/path/to/lich.rb',
        '--dragonrealms',
        '--genie',
        '--platinum',
      ]);

      expect(result).toEqual({
        pid: mockChildProcess.pid,
        host: 'localhost',
        port: 4242,
      });
    });

    it('should start the process for dragonrealms fallen', async () => {
      const result = await startLichProcess({
        gameCode: GameCode.FALLEN,
      });

      expect(mockSpawn).toHaveBeenCalledWith('/path/to/ruby', [
        '/path/to/lich.rb',
        '--dragonrealms',
        '--genie',
        '--fallen',
      ]);

      expect(result).toEqual({
        pid: mockChildProcess.pid,
        host: 'localhost',
        port: 4242,
      });
    });

    it('should start the process for dragonrealms test', async () => {
      const result = await startLichProcess({
        gameCode: GameCode.TEST,
      });

      expect(mockSpawn).toHaveBeenCalledWith('/path/to/ruby', [
        '/path/to/lich.rb',
        '--dragonrealms',
        '--genie',
        '--test',
      ]);

      expect(result).toEqual({
        pid: mockChildProcess.pid,
        host: 'localhost',
        port: 4242,
      });
    });
  });
});
