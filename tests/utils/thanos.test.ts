import { describe, expect, it } from '@jest/globals';
import { HelixChatChatter } from '@twurple/api';
import {
  quotes,
  randomQuote,
  shuffleChatters,
} from '../../src/utils/thanos.ts';

describe('thanos', () => {
  describe('shuffleChatters', () => {
    it('should return the same array if sorted', () => {
      const chatters = [
        {
          userId: '123',
          userDisplayName: 'RicksterGG',
          userName: 'rickstergg',
        },
        {
          userId: '456',
          userDisplayName: 'FadedDice',
          userName: 'fadeddice',
        },
        {
          userId: '789',
          userDisplayName: 'QQobes33',
          userName: 'qqobes33',
        },
      ] as HelixChatChatter[];

      const shuffledChatters = shuffleChatters(chatters);

      // Should be the same at the end of the day.
      expect(chatters.map((c) => c.userName).sort()).toStrictEqual(
        shuffledChatters.map((c) => c.userName).sort(),
      );
    });
  });

  describe('randomQuote', () => {
    it('should return a random quote from quote array', () => {
      const quote = randomQuote();

      expect(quotes).toContain(quote);
    });
  });
});
