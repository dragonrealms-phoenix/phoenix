import { describe, expect, it } from 'vitest';
import { buildSubstituteSetting } from '../substitute.utils.js';

describe('substitute-utils', () => {
  describe('#buildSubstituteSetting', () => {
    it('should build an substitute setting', async () => {
      expect(
        buildSubstituteSetting({
          // empty
        })
      ).toEqual({
        pattern: '',
        replacement: '',
        className: '',
      });

      expect(
        buildSubstituteSetting({
          pattern: 'test-pattern',
        })
      ).toEqual({
        pattern: 'test-pattern',
        replacement: '',
        className: '',
      });

      expect(
        buildSubstituteSetting({
          pattern: 'test-pattern',
          replacement: 'test-replacement',
          className: 'test-class',
        })
      ).toEqual({
        pattern: 'test-pattern',
        replacement: 'test-replacement',
        className: 'test-class',
      });
    });
  });
});
