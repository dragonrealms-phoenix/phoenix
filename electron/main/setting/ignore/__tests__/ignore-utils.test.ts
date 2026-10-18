import { describe, expect, it } from 'vitest';
import { buildIgnoreSetting } from '../ignore.utils.js';

describe('ignore-utils', () => {
  describe('#buildIgnoreSetting', () => {
    it('should build an ignore setting', async () => {
      expect(
        buildIgnoreSetting({
          // empty
        })
      ).toEqual({
        pattern: '',
        className: '',
      });

      expect(
        buildIgnoreSetting({
          pattern: 'test-pattern',
        })
      ).toEqual({
        pattern: 'test-pattern',
        className: '',
      });

      expect(
        buildIgnoreSetting({
          pattern: 'test-pattern',
          className: 'test-class',
        })
      ).toEqual({
        pattern: 'test-pattern',
        className: 'test-class',
      });
    });
  });
});
