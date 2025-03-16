import { describe, expect, it } from 'vitest';
import { buildClassSetting } from '../class.utils.js';

describe('class-utils', () => {
  describe('#buildClassSetting', () => {
    it('should build a class setting', async () => {
      expect(
        buildClassSetting({
          // empty
        })
      ).toEqual({
        name: '',
        enabled: false,
      });

      expect(
        buildClassSetting({
          name: 'test-name',
        })
      ).toEqual({
        name: 'test-name',
        enabled: false,
      });

      expect(
        buildClassSetting({
          name: 'test-name',
          enabled: 'true',
        })
      ).toEqual({
        name: 'test-name',
        enabled: true,
      });

      expect(
        buildClassSetting({
          name: 'test-name',
          enabled: 'false',
        })
      ).toEqual({
        name: 'test-name',
        enabled: false,
      });

      expect(
        buildClassSetting({
          enabled: 'yes',
        })
      ).toEqual({
        name: '',
        enabled: true,
      });

      expect(
        buildClassSetting({
          enabled: 'no',
        })
      ).toEqual({
        name: '',
        enabled: false,
      });
    });
  });
});
