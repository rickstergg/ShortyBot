import { beforeEach, describe, expect, it } from '@jest/globals';
import { Config } from './config';

describe('config', () => {
  describe('initialization', () => {
    describe('with the right env vars', () => {
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
      const OLD_ENV = process.env;

      beforeEach(() => {
        // Restore process.env before testing.
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
