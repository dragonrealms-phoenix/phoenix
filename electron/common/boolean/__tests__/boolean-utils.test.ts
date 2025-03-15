import { describe, expect, it } from 'vitest';
import { toBoolean } from '../boolean.utils.js';

describe('boolean-utils', () => {
  describe('#toBoolean (without default)', () => {
    it('converts value to undefined', async () => {
      expect(toBoolean(null)).toEqual(undefined);
      expect(toBoolean(undefined)).toEqual(undefined);
      expect(toBoolean('foobar')).toEqual(undefined);
      expect(toBoolean(42)).toEqual(undefined);
      expect(toBoolean('42')).toEqual(undefined);
    });

    it('converts value to true', async () => {
      expect(toBoolean(true)).toEqual(true);
      expect(toBoolean(1)).toEqual(true);
      expect(toBoolean('true')).toEqual(true);
      expect(toBoolean('enabled')).toEqual(true);
      expect(toBoolean('on')).toEqual(true);
      expect(toBoolean('yes')).toEqual(true);
      expect(toBoolean('1')).toEqual(true);
    });

    it('converts value to false', async () => {
      expect(toBoolean(false)).toEqual(false);
      expect(toBoolean(0)).toEqual(false);
      expect(toBoolean('false')).toEqual(false);
      expect(toBoolean('disabled')).toEqual(false);
      expect(toBoolean('off')).toEqual(false);
      expect(toBoolean('no')).toEqual(false);
      expect(toBoolean('0')).toEqual(false);
    });
  });

  describe('#toBoolean (with default)', () => {
    it.each([true, false])(
      'returns %s when unable to convert value',
      async (defaultValue: boolean) => {
        expect(toBoolean(null, defaultValue)).toEqual(defaultValue);
        expect(toBoolean(undefined, defaultValue)).toEqual(defaultValue);
        expect(toBoolean('foobar', defaultValue)).toEqual(defaultValue);
        expect(toBoolean(42, defaultValue)).toEqual(defaultValue);
        expect(toBoolean('42', defaultValue)).toEqual(defaultValue);
      }
    );

    it('converts value to true', async () => {
      expect(toBoolean(true, false)).toEqual(true);
      expect(toBoolean(1, false)).toEqual(true);
      expect(toBoolean('true', false)).toEqual(true);
      expect(toBoolean('enabled', false)).toEqual(true);
      expect(toBoolean('on', false)).toEqual(true);
      expect(toBoolean('yes', false)).toEqual(true);
      expect(toBoolean('1', false)).toEqual(true);
    });

    it('converts value to false', async () => {
      expect(toBoolean(false, true)).toEqual(false);
      expect(toBoolean(0, true)).toEqual(false);
      expect(toBoolean('false', true)).toEqual(false);
      expect(toBoolean('disabled', true)).toEqual(false);
      expect(toBoolean('off', true)).toEqual(false);
      expect(toBoolean('no', true)).toEqual(false);
      expect(toBoolean('0', true)).toEqual(false);
    });
  });
});
