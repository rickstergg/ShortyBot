import { describe, expect, it } from '@jest/globals';
import { tokenPath } from './directories.ts';

describe('tokenPath', () => {
  it('should return the token path for a twitchUserId', () => {
    expect(tokenPath('rickstergg')).toBe('./data/tokens.rickstergg.json');
  });
});
