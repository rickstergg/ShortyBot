export const streamerPath = './data/streamers.json';

export const tokenPath = (twitchUserId: string): string => {
  return `./data/tokens.${twitchUserId}.json`;
};
