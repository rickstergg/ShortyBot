import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import { HelixChannelFollower } from '@twurple/api';
import { CheckSpamInput, checkSpam, isExempt } from './checkSpam';

// jest.mock('@twurple/chat', () => ({
//   ChatMessage: jest.fn().mockImplementation(() => {
//     const badges = new Map<string, string>();
//     badges.set('vip', '1');

//     return {
//       userInfo: {
//         badges,
//       },
//       isFirst: false,
//     };
//   }),
// }));

describe('spam', () => {
  describe('isExempt', () => {
    describe('returns true', () => {
      it('if one of the badges are in the exemption list', () => {
        expect(isExempt(['vip', 'subscriber', 'glhf-pledge'])).toBeTruthy();
      });

      it('if all of the badges are in the exemption list', () => {
        expect(isExempt(['vip', 'broadcaster'])).toBeTruthy();
      });
    });

    describe('returns false', () => {
      it('if none of the badges are in the exemption list', () => {
        expect(isExempt(['glhf-pledge', 'subscriber'])).toBeFalsy();
      });
    });
  });

  describe('checkSpam', () => {
    describe('with an exempt badge', () => {
      beforeAll(() => {
        jest.doMock('@twurple/chat', () => ({
          ChatMessage: jest.fn().mockImplementation(() => {
            const badges = new Map<string, string>();
            badges.set('vip', '1');

            return {
              userInfo: {
                badges,
              },
              isFirst: false,
            };
          }),
        }));
      });

      afterAll(() => {
        jest.resetModules();
      });

      it('should return false', () => {
        const { ChatMessage } = require('@twurple/chat');

        const followerData = [];
        const message = new ChatMessage('command', {
          prefix: { nick: 'rickstergg' },
        });

        const input: CheckSpamInput = {
          followerData,
          message,
        };

        expect(checkSpam(input)).toBeFalsy();
      });
    });

    describe('with no exemptions', () => {
      describe('is not following', () => {
        beforeAll(() => {
          jest.doMock('@twurple/chat', () => ({
            ChatMessage: jest.fn().mockImplementation(() => {
              const badges = new Map<string, string>();
              badges.set('subscriber', '33');
              badges.set('glhf-pledge', '1');

              return {
                userInfo: {
                  badges,
                },
                isFirst: false,
              };
            }),
          }));
        });

        afterAll(() => {
          jest.resetModules();
        });

        it('should return true', () => {
          const { ChatMessage } = require('@twurple/chat');

          const followerData = [];

          const message = new ChatMessage('command', {
            prefix: { nick: 'rickstergg' },
          });

          const input: CheckSpamInput = {
            followerData,
            message,
          };

          expect(checkSpam(input)).toBeTruthy();
        });
      });

      describe('has recently followed', () => {
        beforeAll(() => {
          jest.doMock('@twurple/chat', () => ({
            ChatMessage: jest.fn().mockImplementation(() => {
              const badges = new Map<string, string>();
              badges.set('subscriber', '33');
              badges.set('glhf-pledge', '1');

              return {
                userInfo: {
                  badges,
                },
                isFirst: false,
              };
            }),
          }));
        });

        afterAll(() => {
          jest.resetModules();
        });

        it('should return true', () => {
          const { ChatMessage } = require('@twurple/chat');

          const followerData = [
            new HelixChannelFollower({
              user_id: '123',
              user_login: 'asdf',
              user_name: 'asdf',
              followed_at: new Date(new Date().getTime()).toString(),
            }),
          ];

          const message = new ChatMessage('command', {
            prefix: { nick: 'rickstergg' },
          });

          const input: CheckSpamInput = {
            followerData,
            message,
          };

          expect(checkSpam(input)).toBeTruthy();
        });
      });

      describe('sent first message', () => {
        beforeAll(() => {
          jest.doMock('@twurple/chat', () => ({
            ChatMessage: jest.fn().mockImplementation(() => {
              const badges = new Map<string, string>();
              badges.set('subscriber', '33');
              badges.set('glhf-pledge', '1');

              return {
                userInfo: {
                  badges,
                },
                isFirst: true,
              };
            }),
          }));
        });

        afterAll(() => {
          jest.resetModules();
        });

        it('should return true', () => {
          const { ChatMessage } = require('@twurple/chat');
          const followerData = [];

          const message = new ChatMessage('command', {
            prefix: { nick: 'rickstergg' },
          });

          const input: CheckSpamInput = {
            followerData,
            message,
          };

          expect(checkSpam(input)).toBeTruthy();
        });
      });
    });
  });
});
