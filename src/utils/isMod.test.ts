import { describe, expect, it } from '@jest/globals';
import { BotCommandContext } from '@twurple/easy-bot';
import { isMod } from './isMod';

describe('isMod', () => {
  describe('with a broadcaster', () => {
    it('should return true', () => {
      const context = {
        msg: { userInfo: { isMod: false, isBroadcaster: true } },
      } as BotCommandContext;

      expect(isMod(context)).toBeTruthy();
    });
  });

  describe('with a mod', () => {
    it('should return true', () => {
      const context = {
        msg: { userInfo: { isMod: true, isBroadcaster: false } },
      } as BotCommandContext;

      expect(isMod(context)).toBeTruthy();
    });
  });

  describe('with a regular user', () => {
    it('should return false', () => {
      const context = {
        msg: { userInfo: { isMod: false, isBroadcaster: false } },
      } as BotCommandContext;

      expect(isMod(context)).toBeFalsy();
    });
  });
});
