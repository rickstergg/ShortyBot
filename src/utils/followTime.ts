import { HelixChannelFollower } from '@twurple/api';

const THRESHOLD = 10 * 60 * 1000;

export const recentlyFollowed = (data: HelixChannelFollower[]) => {
  if (!data[0]) {
    return false;
  }

  const difference = new Date().getTime() - data[0].followDate.getTime();
  return difference < THRESHOLD;
};
