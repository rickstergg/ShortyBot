import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Config } from '../src/config.ts';

// Stubbed Env Vars
const OLD_ENV = {
  CLIENT_ID: 'asdf',
  CLIENT_SECRET: 'asdf',
  BOT_USER_ID: '123',
  BOT_USER_NAME: 'twitchUsername',
  TWITCH_USER_ID: '123',
  TWITCH_USER_NAME: 'twitchUsername',
  ACCESS_TOKEN: 'asdf',
  REFRESH_TOKEN: 'asdf',
  RIOT_API_KEY: 'RGAPI-asdf',
  OPENAI_API_KEY: 'sk-proj-keyyy',
};

describe('config', () => {
  describe('initialization', () => {
    describe('with the right env vars', () => {
      beforeAll(() => {
        process.env = { ...OLD_ENV };
      });

      it('should initialize properly', () => {
        const config = new Config();

        expect(config).toBeDefined();
        expect(config.clientId).toBeDefined();
        expect(config.clientSecret).toBeDefined();
        expect(config.twitchUserId).toBeDefined();
        expect(config.twitchUserName).toBeDefined();
        expect(config.accessToken).toBeDefined();
        expect(config.refreshToken).toBeDefined();
      });
    });

    describe('without the proper env vars', () => {
      beforeEach(() => {
        process.env = { ...OLD_ENV };
      });

      it('should throw a error regarding client id / secret', () => {
        delete process.env.CLIENT_ID;

        expect(() => {
          new Config();
        }).toThrowError(Error('ClientId or ClientSecret is undefined!'));
      });

      it('should throw an error regarding twitch id / username', () => {
        delete process.env.TWITCH_USER_NAME;

        expect(() => {
          new Config();
        }).toThrowError(Error('TwitchUserName or TwitchUserId is undefined!'));
      });

      it('should throw an error regarding access / refresh tokens', () => {
        delete process.env.REFRESH_TOKEN;

        expect(() => {
          new Config();
        }).toThrowError(Error('AccessToken or RefreshToken is undefined!'));
      });
    });
  });
});
