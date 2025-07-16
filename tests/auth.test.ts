import { RefreshingAuthProvider } from '@twurple/auth';
import { promises as fs } from 'fs';
import { describe, expect, it, vi } from 'vitest';
import { Auth } from '../src/auth.ts';
import { Config } from '../src/config.ts';

const onRefresh = vi.fn();
const addUserForToken = vi.fn();

vi.mock('fs', () => {
  return {
    promises: {
      readFile: vi.fn().mockImplementation(() => {
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

vi.mock('../src/config', () => {
  return {
    Config: vi.fn().mockImplementation(() => {
      return {
        clientId: 'client_id',
        clientSecret: 'secret',
      };
    }),
  };
});

vi.mock('@twurple/auth', () => {
  return {
    RefreshingAuthProvider: vi.fn().mockImplementation(() => {
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
