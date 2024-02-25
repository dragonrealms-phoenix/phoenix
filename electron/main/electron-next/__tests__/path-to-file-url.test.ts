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
    it('returns absolute file url to directory path joined with file path', async () => {
      expect(
        pathToFileURL({
          dirPath: '/a/b/',
          filePath: 'c.html',
        })
      ).toEqual('file:///a/b/c.html');
    });
  });
});
