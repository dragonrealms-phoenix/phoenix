import { describe, expect, it } from 'vitest';
import { buildClassSetting, toClassMap } from '../class.utils.js';

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

  describe('#toClassMap', () => {
    it('should return an empty map for an empty array', async () => {
      expect(toClassMap([])).toEqual({});
    });

    it('should return a map with keys for each setting name', async () => {
      expect(
        toClassMap([
          {
            name: 'test-name-1',
            enabled: true,
          },
          {
            name: 'test-name-2',
            enabled: false,
          },
        ])
      ).toEqual({
        'test-name-1': true,
        'test-name-2': false,
      });
    });
  });
});
