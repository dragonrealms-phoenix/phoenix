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

    it('converts value to true (case-insensitive)', async () => {
      expect(toBoolean(true)).toEqual(true);
      expect(toBoolean(1)).toEqual(true);

      expect(toBoolean('true')).toEqual(true);
      expect(toBoolean('TruE')).toEqual(true);

      expect(toBoolean('enable')).toEqual(true);
      expect(toBoolean('EnAblE')).toEqual(true);

      expect(toBoolean('enabled')).toEqual(true);
      expect(toBoolean('eNaBLeD')).toEqual(true);

      expect(toBoolean('on')).toEqual(true);
      expect(toBoolean('On')).toEqual(true);
      expect(toBoolean('oN')).toEqual(true);
      expect(toBoolean('ON')).toEqual(true);

      expect(toBoolean('yes')).toEqual(true);
      expect(toBoolean('Yes')).toEqual(true);
      expect(toBoolean('yEs')).toEqual(true);
      expect(toBoolean('yeS')).toEqual(true);
      expect(toBoolean('YES')).toEqual(true);

      expect(toBoolean('1')).toEqual(true);
    });

    it('converts value to false (case-insensitive)', async () => {
      expect(toBoolean(false)).toEqual(false);
      expect(toBoolean(0)).toEqual(false);

      expect(toBoolean('false')).toEqual(false);
      expect(toBoolean('FaLsE')).toEqual(false);

      expect(toBoolean('disable')).toEqual(false);
      expect(toBoolean('DisAbLe')).toEqual(false);

      expect(toBoolean('disabled')).toEqual(false);
      expect(toBoolean('dIsAbLeD')).toEqual(false);

      expect(toBoolean('off')).toEqual(false);
      expect(toBoolean('Off')).toEqual(false);
      expect(toBoolean('oFf')).toEqual(false);
      expect(toBoolean('OFF')).toEqual(false);

      expect(toBoolean('no')).toEqual(false);
      expect(toBoolean('No')).toEqual(false);
      expect(toBoolean('nO')).toEqual(false);
      expect(toBoolean('NO')).toEqual(false);

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

    it('converts value to true (case-insensitive)', async () => {
      expect(toBoolean(true, false)).toEqual(true);
      expect(toBoolean(1, false)).toEqual(true);

      expect(toBoolean('true', false)).toEqual(true);
      expect(toBoolean('TruE', false)).toEqual(true);

      expect(toBoolean('enable', false)).toEqual(true);
      expect(toBoolean('EnAblE', false)).toEqual(true);

      expect(toBoolean('enabled', false)).toEqual(true);
      expect(toBoolean('eNaBLeD', false)).toEqual(true);

      expect(toBoolean('on', false)).toEqual(true);
      expect(toBoolean('On', false)).toEqual(true);
      expect(toBoolean('oN', false)).toEqual(true);
      expect(toBoolean('ON', false)).toEqual(true);

      expect(toBoolean('yes', false)).toEqual(true);
      expect(toBoolean('Yes', false)).toEqual(true);
      expect(toBoolean('yEs', false)).toEqual(true);
      expect(toBoolean('yeS', false)).toEqual(true);
      expect(toBoolean('YES', false)).toEqual(true);

      expect(toBoolean('1', false)).toEqual(true);
    });

    it('converts value to false (case-insensitive)', async () => {
      expect(toBoolean(false, true)).toEqual(false);
      expect(toBoolean(0, true)).toEqual(false);

      expect(toBoolean('false', true)).toEqual(false);
      expect(toBoolean('FaLsE', true)).toEqual(false);

      expect(toBoolean('disable', true)).toEqual(false);
      expect(toBoolean('DisAbLe', true)).toEqual(false);

      expect(toBoolean('disabled', true)).toEqual(false);
      expect(toBoolean('dIsAbLeD', true)).toEqual(false);

      expect(toBoolean('off', true)).toEqual(false);
      expect(toBoolean('Off', true)).toEqual(false);
      expect(toBoolean('oFf', true)).toEqual(false);
      expect(toBoolean('OFF', true)).toEqual(false);

      expect(toBoolean('no', true)).toEqual(false);
      expect(toBoolean('No', true)).toEqual(false);
      expect(toBoolean('nO', true)).toEqual(false);
      expect(toBoolean('NO', true)).toEqual(false);

      expect(toBoolean('0', true)).toEqual(false);
    });
  });
});
