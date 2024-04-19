import { describe, expect, it } from '@jest/globals';
import { quotes, randomQuote, shuffleNames } from './thanos';

describe('thanos', () => {
  describe('shuffleNames', () => {
    it('should return true', () => {
      const users = ['rickstergg', 'fadeddice', 'qqobes33'];
      const shuffledUsers = shuffleNames(users);

      // Should be the same at the end of the day.
      expect(users.sort()).toStrictEqual(shuffledUsers.sort());
    });
  });

  describe('randomQuote', () => {
    it('should return a random quote from quote array', () => {
      const quote = randomQuote();

      expect(quotes).toContain(quote);
    });
  });
});
