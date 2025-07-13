import { beforeAll, describe, expect, it, jest } from '@jest/globals';
import { promises as fs } from 'fs';
import { Shoutouts } from '../src/shoutouts.ts';
import { streamerPath } from '../src/utils/directories.ts';

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
      await manager.initialize('rickstergg');

      expect(fs.readFile).toBeCalledWith(streamerPath, 'utf-8');
      expect(manager.streamerList).toHaveLength(3);
    });
  });

  describe('shouldShoutOut', () => {
    let manager: Shoutouts;

    beforeAll(async () => {
      manager = new Shoutouts();
      await manager.initialize('rickstergg');
    });

    it('should actively exclude the streamer from the list if it exists', () => {
      expect(manager.streamersToShoutout.has('rickstergg')).toBeFalsy();
      expect(manager.streamersToShoutout.size).toBe(2);
    });

    it('should return false for a streamer not in the list', () => {
      expect(manager.shouldShoutOut('not a streamer')).toBeFalsy();
    });

    it('should return true for a streamer in the list the first time', () => {
      expect(manager.shouldShoutOut('qqobes33')).toBeTruthy();
      expect(manager.streamersToShoutout.size).toBe(1);
    });

    it('should return false for a streamer already shoutted out', () => {
      expect(manager.shouldShoutOut('qqobes33')).toBeFalsy();
    });
  });

  describe('reset', () => {
    it('should reset the streamer list after reading', async () => {
      const manager = new Shoutouts();
      await manager.initialize('rickstergg');

      expect(manager.streamersToShoutout.size).toBe(2);
      manager.shouldShoutOut('qqobes33');
      expect(manager.streamersToShoutout.size).toBe(1);

      manager.reset();
      expect(manager.streamersToShoutout.size).toBe(2);
    });
  });
});
