import { describe, expect, it } from 'vitest';
import { buildTriggerSetting } from '../trigger.utils.js';

describe('class-utils', () => {
  describe('#buildTriggerSetting', () => {
    it('should build a class setting', async () => {
      expect(
        buildTriggerSetting({
          // empty
        })
      ).toEqual({
        pattern: '',
        action: '',
        className: '',
      });

      expect(
        buildTriggerSetting({
          pattern: 'test-pattern',
        })
      ).toEqual({
        pattern: 'test-pattern',
        action: '',
        className: '',
      });

      expect(
        buildTriggerSetting({
          pattern: 'test-pattern',
          action: 'test-action',
        })
      ).toEqual({
        pattern: 'test-pattern',
        action: 'test-action',
        className: '',
      });

      expect(
        buildTriggerSetting({
          pattern: 'test-pattern',
          action: 'test-action',
          className: 'test-class',
        })
      ).toEqual({
        pattern: 'test-pattern',
        action: 'test-action',
        className: 'test-class',
      });

      expect(
        buildTriggerSetting({
          pattern: 'test-pattern',
          action: 'test-action; another-action',
          className: 'test-class',
        })
      ).toEqual({
        pattern: 'test-pattern',
        action: 'test-action; another-action',
        className: 'test-class',
      });
    });
  });
});
