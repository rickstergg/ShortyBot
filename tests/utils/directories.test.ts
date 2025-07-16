import { describe, expect, it } from 'vitest';
import { tokenPath } from '../../src/utils/directories.ts';

describe('tokenPath', () => {
  it('should return the token path for a twitchUserId', () => {
    expect(tokenPath('rickstergg')).toBe('./data/tokens.rickstergg.json');
  });
});
