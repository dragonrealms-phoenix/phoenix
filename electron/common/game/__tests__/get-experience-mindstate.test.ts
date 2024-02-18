import { describe, expect, it } from 'vitest';
import { getExperienceMindState } from '../get-experience-mindstate.js';
import { ExperienceMindState } from '../types.js';

describe('get-experience-mindstate', () => {
  it('returns the correct value for the given mind state (enum test)', () => {
    Object.keys(ExperienceMindState).forEach((mindState) => {
      expect(getExperienceMindState(mindState)).toEqual(
        ExperienceMindState[mindState as keyof typeof ExperienceMindState]
      );
    });
  });

  it('returns the correct value for the given mind state (explicit test)', () => {
    // I added this test because at one point I had accidentally
    // removed some of the mind states from the enum but no test caught it.
    expect(getExperienceMindState('clear')).toEqual(0);
    expect(getExperienceMindState('dabbling')).toEqual(1);
    expect(getExperienceMindState('perusing')).toEqual(2);
    expect(getExperienceMindState('learning')).toEqual(3);
    expect(getExperienceMindState('thoughtful')).toEqual(4);
    expect(getExperienceMindState('thinking')).toEqual(5);
    expect(getExperienceMindState('considering')).toEqual(6);
    expect(getExperienceMindState('pondering')).toEqual(7);
    expect(getExperienceMindState('ruminating')).toEqual(8);
    expect(getExperienceMindState('concentrating')).toEqual(9);
    expect(getExperienceMindState('attentive')).toEqual(10);
    expect(getExperienceMindState('deliberative')).toEqual(11);
    expect(getExperienceMindState('interested')).toEqual(12);
    expect(getExperienceMindState('examining')).toEqual(13);
    expect(getExperienceMindState('understanding')).toEqual(14);
    expect(getExperienceMindState('absorbing')).toEqual(15);
    expect(getExperienceMindState('intrigued')).toEqual(16);
    expect(getExperienceMindState('scrutinizing')).toEqual(17);
    expect(getExperienceMindState('analyzing')).toEqual(18);
    expect(getExperienceMindState('studious')).toEqual(19);
    expect(getExperienceMindState('focused')).toEqual(20);
    expect(getExperienceMindState('very focused')).toEqual(21);
    expect(getExperienceMindState('engaged')).toEqual(22);
    expect(getExperienceMindState('very engaged')).toEqual(23);
    expect(getExperienceMindState('cogitating')).toEqual(24);
    expect(getExperienceMindState('fascinated')).toEqual(25);
    expect(getExperienceMindState('captivated')).toEqual(26);
    expect(getExperienceMindState('engrossed')).toEqual(27);
    expect(getExperienceMindState('riveted')).toEqual(28);
    expect(getExperienceMindState('very riveted')).toEqual(29);
    expect(getExperienceMindState('rapt')).toEqual(30);
    expect(getExperienceMindState('very rapt')).toEqual(31);
    expect(getExperienceMindState('enthralled')).toEqual(32);
    expect(getExperienceMindState('nearly locked')).toEqual(33);
    expect(getExperienceMindState('mind lock')).toEqual(34);
  });

  it('returns undefined if the given mind state is invalid', () => {
    expect(getExperienceMindState('foo')).toBe(undefined);
  });
});
