import { describe, expect, it } from '@jest/globals';
import { HelixChannelFollower } from '@twurple/api';
import { recentlyFollowed } from './followTime';

describe('recentlyFollowed', () => {
  it('should return false if there is no data', () => {
    expect(recentlyFollowed([])).toBeFalsy();
  });

  it('should return true if the follow time is within threshold', () => {
    const newFollower = new HelixChannelFollower({
      user_id: '123',
      user_login: 'asdf',
      user_name: 'asdf',
      followed_at: new Date(new Date().getTime()).toString(),
    });

    expect(recentlyFollowed([newFollower])).toBeTruthy();
  });

  it('should return false if user followed before the threshold', () => {
    const oldFollower = new HelixChannelFollower({
      user_id: '123',
      user_login: 'asdf',
      user_name: 'asdf',
      followed_at: new Date(0).toString(),
    });

    expect(recentlyFollowed([oldFollower])).toBeFalsy();
  });
});
