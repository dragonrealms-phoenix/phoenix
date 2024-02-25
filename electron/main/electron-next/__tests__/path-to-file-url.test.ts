import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { pathToFileURL } from '../path-to-file-url.js';

describe('path-to-file-url', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#pathToFileURL', () => {
    it('...', async () => {
      expect(
        pathToFileURL({
          dirPath: '/a/b/',
          filePath: '/a/b/c.html',
        })
      ).toBe(true);
    });
  });
});
