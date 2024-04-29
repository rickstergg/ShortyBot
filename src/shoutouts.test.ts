import { beforeAll, describe, expect, it, jest } from '@jest/globals';
import { promises as fs } from 'fs';
import { Shoutouts } from './shoutouts';
import { streamerPath } from './utils/directories';

jest.mock('fs', () => {
  return {
    promises: {
      readFile: jest.fn().mockImplementation(() => {
        return JSON.stringify({
          streamers: ['rickstergg', 'qqobes33', 'fadeddice'],
        });
      }),
    },
  };
});

describe('shoutoutManager', () => {
  describe('initialization', () => {
    it('should read the streamer path file', async () => {
      const manager = new Shoutouts();
      await manager.initialize();

      expect(fs.readFile).toBeCalledWith(streamerPath, 'utf-8');
      expect(manager.streamerList).toHaveLength(3);
    });
  });

  describe('shouldShoutOut', () => {
    let manager: Shoutouts;

    beforeAll(async () => {
      manager = new Shoutouts();
      await manager.initialize();
    });

    it('should return false for a streamer not in the list', () => {
      expect(manager.shouldShoutOut('not a streamer')).toBeFalsy();
    });

    it('should return true for a streamer in the list the first time', () => {
      expect(manager.shouldShoutOut('rickstergg')).toBeTruthy();
      expect(manager.streamersToShoutout.size).toBe(2);
    });

    it('should return false for a streamer already shoutted out', () => {
      expect(manager.shouldShoutOut('rickstergg')).toBeFalsy();
    });
  });

  describe('reset', () => {
    it('should reset the streamer list after reading', async () => {
      const manager = new Shoutouts();
      await manager.initialize();

      expect(manager.streamersToShoutout.size).toBe(3);
      manager.shouldShoutOut('rickstergg');
      expect(manager.streamersToShoutout.size).toBe(2);

      manager.reset();
      expect(manager.streamersToShoutout.size).toBe(3);
    });
  });
});
