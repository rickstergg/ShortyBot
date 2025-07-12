import { describe, expect, it, jest } from '@jest/globals';
import { RefreshingAuthProvider } from '@twurple/auth';
import { promises as fs } from 'fs';
import { Auth } from './auth.ts';
import { Config } from './config.ts';

const onRefresh = jest.fn();
const addUserForToken = jest.fn();

jest.mock('fs', () => {
  return {
    promises: {
      readFile: jest.fn().mockImplementation(() => {
        return JSON.stringify({
          accessToken: 'asdf',
          expiresIn: 0,
          refreshToken: 'asdf',
          scope: ['user:bot'],
          tokenType: 'bearer',
        });
      }),
    },
  };
});

jest.mock('./config', () => {
  return {
    Config: jest.fn().mockImplementation(() => {
      return {
        clientId: 'client_id',
        clientSecret: 'secret',
      };
    }),
  };
});

jest.mock('@twurple/auth', () => {
  return {
    RefreshingAuthProvider: jest.fn().mockImplementation(() => {
      return {
        onRefresh,
        addUserForToken,
      };
    }),
  };
});

describe('Auth', () => {
  describe('constructor', () => {
    it('is defined properly', () => {
      const config = new Config();
      const auth = new Auth(config);

      expect(auth).toBeDefined();
      expect(auth.config).toBeDefined();
    });
  });

  describe('initializeAuthProvider', () => {
    it('should read from tokens file, call RefreshingAuthProvider, and add Token', async () => {
      const config = new Config();
      const auth = new Auth(config);

      await auth.initializeAuthProvider();

      expect(fs.readFile).toHaveBeenCalled();
      expect(RefreshingAuthProvider).toHaveBeenCalledWith({
        clientId: 'client_id',
        clientSecret: 'secret',
      });
      expect(onRefresh).toHaveBeenCalled();
      expect(addUserForToken).toHaveBeenCalled();
    });
  });
});
