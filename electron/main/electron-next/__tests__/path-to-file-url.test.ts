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
    it('prepends file protocol when given absolute path', async () => {
      const filePath = '/a/b/c.html';
      expect(pathToFileURL(filePath)).toEqual(`file://${filePath}`);
    });

    it('prepends file protocol and working directory when given relative path', async () => {
      const cwd = process.cwd();
      const filePath = 'a/b/c.html';
      expect(pathToFileURL(filePath)).toEqual(`file://${cwd}/${filePath}`);
    });
  });
});
