import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isSafePath } from '../is-safe-path.js';

describe('is-safe-path', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#isSafePath', () => {
    it('returns true when file path is within the directory', async () => {
      expect(
        isSafePath({
          dirPath: '/a/b/',
          filePath: '/a/b/c.html',
        })
      ).toBe(true);

      expect(
        isSafePath({
          dirPath: '/a/b/',
          filePath: '/a/b/c/d.html',
        })
      ).toBe(true);
    });

    it('returns false when file path is outside the directory', async () => {
      expect(
        isSafePath({
          dirPath: '/a/b/',
          filePath: '',
        })
      ).toBe(false);

      expect(
        isSafePath({
          dirPath: '/a/b/',
          filePath: '/a/b/',
        })
      ).toBe(false);

      expect(
        isSafePath({
          dirPath: '/a/b/',
          filePath: './a/b/c.html',
        })
      ).toBe(false);

      expect(
        isSafePath({
          dirPath: '/a/b/',
          filePath: '../a/b/c.html',
        })
      ).toBe(false);
    });
  });
});
