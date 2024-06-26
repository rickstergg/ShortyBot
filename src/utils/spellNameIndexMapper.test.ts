import { describe, expect, it } from '@jest/globals';
import { spellNameIndexMapper } from './spellNameIndexMapper';

describe('spellNameIndexMapper', () => {
  it('should return the index for a spell', () => {
    expect(spellNameIndexMapper['q']).toBe(0);
    expect(spellNameIndexMapper['w']).toBe(1);
    expect(spellNameIndexMapper['e']).toBe(2);
    expect(spellNameIndexMapper['r']).toBe(3);
  });

  it('should return undefined for any other spell', () => {
    expect(spellNameIndexMapper['g']).toBe(undefined);
  });
});
