import { describe, expect, it } from 'vitest';
import { unescapeEntities } from '../unescape-entities.js';

describe('unescape-entities', () => {
  it('unescapes HTML entities in the text', () => {
    const text = '&lt;div&gt;Hello, &amp;world!&lt;/div&gt;';
    const expected = '<div>Hello, &world!</div>';
    const result = unescapeEntities(text);
    expect(result).toEqual(expected);
  });

  it('unescapes custom entities', () => {
    const text = '&customEntity1; &customEntity2;';
    const options = {
      entities: {
        customEntity1: 'Custom 1',
        customEntity2: 'Custom 2',
      },
    };
    const expected = 'Custom 1 Custom 2';
    const result = unescapeEntities(text, options);
    expect(result).toEqual(expected);
  });

  it('does not unescape unknown entities', () => {
    const text = '&unknownEntity;';
    const expected = '&unknownEntity;';
    const result = unescapeEntities(text);
    expect(result).toEqual(expected);
  });
});
